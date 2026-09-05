"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PlayIcon, SparklesIcon, XIcon } from "lucide-react";

import { SectionHeader } from "#/components/dashboard/kit";
import { Button } from "#/components/ui/button";
import {
  ONBOARDING_VIDEO,
  formatDuration,
  formatTimecode,
  getOnboardingVideoUrl,
} from "#/lib/dashboard/onboarding-video";
import { useOnboardingProgress } from "#/lib/dashboard/use-onboarding-progress";

import { OnboardingVideoDialog } from "./onboarding-video-dialog";

/**
 * Prévient l'auteur du déploiement, pas le praticien.
 *
 * Sans URL il n'y a rien à montrer : on préfère ne rien afficher plutôt qu'une
 * carte au bouton mort. Mais quelqu'un qui vient de brancher la fonctionnalité
 * doit comprendre pourquoi elle ne s'affiche pas, d'où l'avertissement en
 * développement.
 */
function useMissingVideoWarning(videoUrl: string | undefined) {
  useEffect(() => {
    if (!videoUrl && process.env.NODE_ENV !== "production") {
      console.warn(
        "[onboarding] NEXT_PUBLIC_ONBOARDING_VIDEO_URL n'est pas définie : la carte de présentation reste masquée.",
      );
    }
  }, [videoUrl]);
}

/**
 * La carte de bienvenue, en tête de la vue d'ensemble.
 *
 * Elle ne charge aucune vidéo tant qu'on n'a pas cliqué : l'affiche est une
 * image de 76 Ko, et l'élément `<video>` n'existe qu'à l'intérieur de la
 * modale. Le premier écran du dashboard ne paie donc pas les 29 Mo du fichier.
 */
export function OnboardingVideoCard() {
  const videoUrl = getOnboardingVideoUrl();
  const { dismiss, progress, saveProgress, shouldPromptOnboarding } =
    useOnboardingProgress();
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useMissingVideoWarning(videoUrl);

  if (!videoUrl || !progress || !shouldPromptOnboarding) {
    return null;
  }

  const hasStarted = progress.lastTime > 5;

  return (
    <section className="relative overflow-hidden rounded-card border border-border bg-card">
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={dismiss}
        aria-label="Masquer la présentation"
        className="absolute right-2 top-2 z-10 text-muted-foreground"
      >
        <XIcon />
      </Button>

      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_20rem] md:items-center md:gap-6">
        <div className="min-w-0">
          <SectionHeader eyebrow="Prise en main" title="Bienvenue sur Biume" />

          <p className="-mt-2 max-w-prose text-sm leading-6 text-muted-foreground">
            Une visite guidée de {formatDuration(ONBOARDING_VIDEO.duration)},
            découpée en {ONBOARDING_VIDEO.chapters.length} chapitres : ouvrez
            celui de la page sur laquelle vous butez, sans regarder le reste.
          </p>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {ONBOARDING_VIDEO.chapters.map((chapter) => (
              <li
                key={chapter.id}
                className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {chapter.label}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="lg" onClick={() => setIsPlayerOpen(true)}>
              <SparklesIcon data-icon="inline-start" />
              {hasStarted
                ? `Reprendre à ${formatTimecode(progress.lastTime)}`
                : "Regarder la présentation"}
            </Button>
            <Button size="lg" variant="ghost" onClick={dismiss}>
              Plus tard
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPlayerOpen(true)}
          aria-label="Lancer la présentation de Biume"
          className="group relative order-first block w-full overflow-hidden rounded-lg border border-border bg-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:order-none"
        >
          <Image
            src={ONBOARDING_VIDEO.poster}
            alt=""
            width={1280}
            height={872}
            sizes="(min-width: 768px) 20rem, 100vw"
            className="aspect-[1280/872] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />

          <span className="absolute inset-0 grid place-items-center bg-slate-950/20 transition-colors group-hover:bg-slate-950/10">
            <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-white/25 transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              <PlayIcon className="size-5 translate-x-px" aria-hidden />
            </span>
          </span>

          <span className="absolute bottom-2 right-2 rounded-md bg-slate-950/75 px-1.5 py-0.5 font-mono text-xs tabular-nums text-white">
            {formatTimecode(ONBOARDING_VIDEO.duration)}
          </span>
        </button>
      </div>

      <OnboardingVideoDialog
        open={isPlayerOpen}
        onOpenChange={setIsPlayerOpen}
        src={videoUrl}
        resumeAt={progress.lastTime}
        watchedSeconds={progress.watchedSeconds}
        onProgress={saveProgress}
      />
    </section>
  );
}

/**
 * Le rappel discret, en pied de vue d'ensemble.
 *
 * Une fois la présentation vue ou écartée, la carte disparaît — mais la vidéo
 * reste le seul endroit où l'on explique le produit. La retirer sans laisser de
 * porte d'entrée obligerait à vider son stockage pour la revoir.
 */
export function OnboardingReplayLink() {
  const videoUrl = getOnboardingVideoUrl();
  const { progress, saveProgress, shouldPromptOnboarding } =
    useOnboardingProgress();
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  if (!videoUrl || !progress || shouldPromptOnboarding) {
    return null;
  }

  return (
    <div className="flex justify-center pt-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsPlayerOpen(true)}
        className="text-muted-foreground"
      >
        <PlayIcon data-icon="inline-start" />
        Revoir la présentation ({formatDuration(ONBOARDING_VIDEO.duration)})
      </Button>

      <OnboardingVideoDialog
        open={isPlayerOpen}
        onOpenChange={setIsPlayerOpen}
        src={videoUrl}
        resumeAt={0}
        watchedSeconds={progress.watchedSeconds}
        onProgress={saveProgress}
      />
    </div>
  );
}
