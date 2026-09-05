"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckIcon,
  MaximizeIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "#/components/ui/dialog";
import { Button } from "#/components/ui/button";
import {
  ONBOARDING_VIDEO,
  buildChapterSegments,
  formatTimecode,
  isChapterWatched,
  resolveActiveChapterIndex,
} from "#/lib/dashboard/onboarding-video";
import { cn } from "#/lib/utils";

const SEEK_STEP_SECONDS = 10;

/**
 * Toutes les combien de secondes de lecture on écrit la progression.
 *
 * `timeupdate` se déclenche quatre fois par seconde : persister à chaque
 * événement ferait plusieurs milliers d'écritures dans `localStorage` sur une
 * lecture complète, pour une information qui n'a besoin d'être juste qu'à
 * quelques secondes près.
 */
const PROGRESS_SAVE_INTERVAL_SECONDS = 5;

/**
 * L'écart maximal entre deux relevés qui compte comme de la lecture continue.
 *
 * Généreux face aux ~250 ms réels de `timeupdate`, pour absorber un onglet en
 * arrière-plan ou une image saccadée, mais très en dessous du plus court des
 * chapitres — un saut ne peut donc pas passer pour de la lecture.
 */
const CONTINUOUS_PLAYBACK_MAX_DELTA = 2;

type OnboardingVideoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  /** Position de reprise, héritée de la session précédente. */
  resumeAt: number;
  /** Secondes déjà lues par chapitre — ce sont elles qui cochent. */
  watchedSeconds: Readonly<Record<string, number>>;
  onProgress: (
    currentTime: number,
    watchedDelta: Record<string, number>,
  ) => void;
};

/**
 * La modale, réduite à son enveloppe.
 *
 * Tout l'état de lecture vit dans `OnboardingPlayer`, que la modale monte et
 * démonte avec son contenu : sa fermeture remet donc le lecteur à zéro sans
 * qu'aucun effet n'ait à le réinitialiser à la main.
 */
export function OnboardingVideoDialog({
  onOpenChange,
  onProgress,
  open,
  resumeAt,
  src,
  watchedSeconds,
}: OnboardingVideoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* `4xl` plutôt que `5xl` : la vidéo fait 1280×872, et une modale plus
          large ne l'agrandit pas — elle ne fait qu'ajouter des bandes noires
          de part et d'autre, la hauteur étant déjà bornée par `max-h`. */}
      <DialogContent className="flex max-h-[92vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <OnboardingPlayer
          onProgress={onProgress}
          resumeAt={resumeAt}
          src={src}
          watchedSeconds={watchedSeconds}
        />
      </DialogContent>
    </Dialog>
  );
}

type OnboardingPlayerProps = Omit<
  OnboardingVideoDialogProps,
  "open" | "onOpenChange"
>;

function OnboardingPlayer({
  onProgress,
  resumeAt,
  src,
  watchedSeconds,
}: OnboardingPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const lastSavedRef = useRef(resumeAt);
  const previousTimeRef = useRef(resumeAt);
  const pendingWatchedRef = useRef<Record<string, number>>({});

  const [currentTime, setCurrentTime] = useState(resumeAt);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const segments = useMemo(() => buildChapterSegments(), []);
  const duration = ONBOARDING_VIDEO.duration;
  const activeChapterIndex = resolveActiveChapterIndex(currentTime);
  const activeChapter = segments[activeChapterIndex]!;

  /**
   * Compte les secondes réellement lues, chapitre par chapitre.
   *
   * Un `timeupdate` arrive quatre fois par seconde pendant la lecture : deux
   * relevés consécutifs sont donc séparés d'une fraction de seconde. Un écart
   * plus grand ne peut pas venir de la lecture — c'est un saut (barre, chapitre,
   * flèches), et les secondes survolées n'ont été vues par personne. Sans ce
   * garde-fou, sauter au dernier chapitre cocherait tous les précédents.
   */
  const accumulateWatched = useCallback(
    (time: number) => {
      const previous = previousTimeRef.current;
      previousTimeRef.current = time;

      const delta = time - previous;

      if (delta <= 0 || delta > CONTINUOUS_PLAYBACK_MAX_DELTA) {
        return;
      }

      const chapterId = segments[resolveActiveChapterIndex(previous)]!.id;
      const pending = pendingWatchedRef.current;

      pending[chapterId] = (pending[chapterId] ?? 0) + delta;
    },
    [segments],
  );

  /**
   * Écrit la position et vide le compteur de secondes en attente.
   *
   * Le compteur est remis à zéro avant l'écriture : `saveProgress` additionne,
   * donc renvoyer deux fois le même écart le compterait deux fois.
   */
  const flushProgress = useCallback(
    (time: number) => {
      const pending = pendingWatchedRef.current;

      pendingWatchedRef.current = {};
      onProgress(time, pending);
    },
    [onProgress],
  );

  /**
   * Déplace la lecture, sans rien écrire.
   *
   * La persistance est laissée à `timeupdate` (et à la fermeture) : appelée
   * ici, elle produirait une écriture `localStorage` par événement
   * `pointermove`, soit des dizaines par seconde pendant qu'on fait glisser le
   * curseur sur la barre. Un saut déclenche de toute façon un `timeupdate`
   * juste après, et l'écart dépasse alors le seuil — la position part donc
   * bien au stockage, une seule fois.
   */
  const seekTo = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      const time = Math.min(Math.max(seconds, 0), duration);

      if (video) {
        video.currentTime = time;
      }

      setCurrentTime(time);
    },
    [duration],
  );

  const togglePlay = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      // `play()` ne renvoie une promesse que depuis les navigateurs modernes,
      // et pas du tout sous jsdom : on ne branche `catch` que s'il y en a une.
      const started: unknown = video.play();

      if (started instanceof Promise) {
        started.catch(() => {
          // Lecture refusée par le navigateur : le bouton reprend son état
          // « en pause », c'est `onPause` qui fait foi.
        });
      }
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;

    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  }, []);

  const requestFullscreen = useCallback(() => {
    const requested: unknown = videoRef.current?.requestFullscreen?.();

    if (requested instanceof Promise) {
      requested.catch(() => {
        // Refusé (iOS Safari ne le propose que via son lecteur natif) : sans
        // conséquence, la vidéo reste lisible dans la modale.
      });
    }
  }, []);

  /**
   * Le temps correspondant à une abscisse dans la barre.
   *
   * On mesure sur la barre entière plutôt que sur le segment cliqué : les
   * segments sont séparés par des espaces, et viser un chapitre par son bord
   * doit tomber sur sa première seconde, pas dans l'espace d'à côté.
   */
  const timeFromPointer = useCallback(
    (clientX: number) => {
      const bar = barRef.current;

      if (!bar) {
        return 0;
      }

      const rect = bar.getBoundingClientRect();
      const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;

      return Math.min(Math.max(ratio, 0), 1) * duration;
    },
    [duration],
  );

  const handleScrub = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      seekTo(timeFromPointer(event.clientX));
    },
    [seekTo, timeFromPointer],
  );

  const handleScrubMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        seekTo(timeFromPointer(event.clientX));
      }
    },
    [seekTo, timeFromPointer],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      const onControl = target?.closest("button") !== null;

      switch (event.key) {
        case " ":
          // Espace sur un bouton doit activer ce bouton, pas la lecture.
          if (onControl) {
            return;
          }

          event.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          event.preventDefault();
          seekTo(currentTime - SEEK_STEP_SECONDS);
          break;
        case "ArrowRight":
          event.preventDefault();
          seekTo(currentTime + SEEK_STEP_SECONDS);
          break;
        case "m":
        case "M":
          toggleMute();
          break;
        case "f":
        case "F":
          requestFullscreen();
          break;
        default:
          break;
      }
    },
    [currentTime, requestFullscreen, seekTo, toggleMute, togglePlay],
  );

  /**
   * Au démontage, tout ce qui n'a pas encore été écrit part au stockage.
   *
   * `timeupdate` ne persiste que toutes les cinq secondes : sans ça, fermer
   * juste après un saut perdrait le saut, et les dernières secondes lues ne
   * seraient comptées dans aucun chapitre. Passer par des refs plutôt que par
   * les dépendances garde le nettoyage attaché au seul démontage — c'est-à-dire
   * à la fermeture de la modale, Échap et clic sur le fond compris.
   */
  const currentTimeRef = useRef(resumeAt);
  const flushProgressRef = useRef(flushProgress);

  useEffect(() => {
    currentTimeRef.current = currentTime;
    flushProgressRef.current = flushProgress;
  });

  useEffect(() => {
    return () => {
      flushProgressRef.current(currentTimeRef.current);
    };
  }, []);

  const showResumeHint = resumeAt > 5 && currentTime < resumeAt + 5;

  return (
    <div className="flex min-h-0 flex-col" onKeyDown={handleKeyDown}>
      <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
            Présentation de Biume
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-sm text-muted-foreground">
            {formatTimecode(duration)} — Chapitre {activeChapterIndex + 1} sur{" "}
            {segments.length} · {activeChapter.label}
          </DialogDescription>
        </div>
      </div>

      <div className="bg-slate-950">
        {/* Pas de piste `<track>` : les sous-titres sont incrustés dans
            l'image de la vidéo source. */}
        <video
          ref={videoRef}
          src={src}
          poster={ONBOARDING_VIDEO.poster}
          playsInline
          autoPlay
          className="mx-auto max-h-[58vh] w-full object-contain"
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;

            setIsMuted(video.muted);

            // Reprendre à la position mémorisée — sauf tout près de la fin,
            // où l'on rouvrirait la vidéo sur son générique.
            if (resumeAt > 0 && resumeAt < duration - 15) {
              video.currentTime = resumeAt;
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(event) => {
            const time = event.currentTarget.currentTime;

            accumulateWatched(time);
            setCurrentTime(time);

            if (
              Math.abs(time - lastSavedRef.current) >=
              PROGRESS_SAVE_INTERVAL_SECONDS
            ) {
              lastSavedRef.current = time;
              flushProgress(time);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            flushProgress(duration);
          }}
        />
      </div>

      <div className="grid gap-3 overflow-y-auto border-t border-border px-4 py-3 sm:px-5">
        <div
          ref={barRef}
          role="slider"
          tabIndex={0}
          aria-label="Progression de la présentation"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={`${formatTimecode(currentTime)} — ${activeChapter.label}`}
          className="flex cursor-pointer touch-none items-center gap-1 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          onPointerDown={handleScrub}
          onPointerMove={handleScrubMove}
        >
          {segments.map((segment) => {
            const played = Math.min(
              Math.max((currentTime - segment.startsAt) / segment.duration, 0),
              1,
            );

            return (
              <div
                key={segment.id}
                className="relative h-2 overflow-hidden rounded-full bg-foreground/15"
                style={{ flexGrow: segment.duration, flexBasis: 0 }}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-primary"
                  style={{ width: `${played * 100}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="icon"
            onClick={togglePlay}
            aria-label={isPlaying ? "Mettre en pause" : "Reprendre la lecture"}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => seekTo(currentTime - SEEK_STEP_SECONDS)}
            aria-label="Reculer de 10 secondes"
          >
            <RotateCcwIcon />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => seekTo(currentTime + SEEK_STEP_SECONDS)}
            aria-label="Avancer de 10 secondes"
          >
            <RotateCwIcon />
          </Button>

          <p className="ml-1 font-mono text-xs tabular-nums text-muted-foreground">
            {formatTimecode(currentTime)} / {formatTimecode(duration)}
          </p>

          {showResumeHint ? (
            <p className="rounded-full border border-primary-border bg-primary-surface px-2 py-0.5 text-xs font-medium text-primary">
              Reprise à {formatTimecode(resumeAt)}
            </p>
          ) : null}

          <div className="ml-auto flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              aria-label={isMuted ? "Rétablir le son" : "Couper le son"}
            >
              {isMuted ? <VolumeXIcon /> : <Volume2Icon />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={requestFullscreen}
              aria-label="Passer en plein écran"
            >
              <MaximizeIcon />
            </Button>
          </div>
        </div>

        <p className="text-sm leading-5 text-muted-foreground">
          {activeChapter.summary}
        </p>

        <ul className="flex flex-wrap gap-1.5" aria-label="Chapitres">
          {segments.map((segment, index) => {
            const isActive = index === activeChapterIndex;
            const watched = isChapterWatched(segment, watchedSeconds);

            return (
              <li key={segment.id}>
                <button
                  type="button"
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => seekTo(segment.startsAt)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary-border bg-primary-surface text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {watched && !isActive ? (
                    <CheckIcon aria-hidden className="size-3 text-success" />
                  ) : (
                    <span
                      aria-hidden
                      className={cn(
                        "font-mono text-[0.65rem]",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                  <span>{segment.label}</span>
                  <span className="font-mono tabular-nums opacity-60">
                    {formatTimecode(segment.startsAt)}
                  </span>
                  {watched ? (
                    <span className="sr-only">Chapitre déjà vu</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
