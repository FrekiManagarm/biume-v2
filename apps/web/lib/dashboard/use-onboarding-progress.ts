"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  ONBOARDING_COMPLETION_RATIO,
  ONBOARDING_VIDEO,
  totalWatchedSeconds,
} from "./onboarding-video";

/**
 * Où en est le praticien dans la présentation.
 *
 * L'état vit dans `localStorage` et pas en base : il n'engage rien, ne sert à
 * personne d'autre qu'au navigateur qui l'écrit, et le mettre en base
 * coûterait une migration et un aller-retour réseau sur le premier écran du
 * dashboard pour décider d'afficher une carte.
 */
export type OnboardingProgress = {
  dismissed: boolean;
  /**
   * Secondes effectivement jouées, par identifiant de chapitre.
   *
   * C'est ce compteur qui coche les chapitres, et non le point le plus loin
   * atteint : sauter à la fin ne fait pas d'un chapitre un chapitre vu.
   */
  watchedSeconds: Readonly<Record<string, number>>;
  /** Où reprendre la lecture. */
  lastTime: number;
};

export const ONBOARDING_PROGRESS_STORAGE_KEY =
  "biume.onboarding.presentation.v1";

const EMPTY_PROGRESS: OnboardingProgress = {
  dismissed: false,
  watchedSeconds: {},
  lastTime: 0,
};

const clampToVideo = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), ONBOARDING_VIDEO.duration);
};

/**
 * Relit ce qu'une session précédente a stocké.
 *
 * Le contenu de `localStorage` est modifiable par n'importe qui depuis la
 * console : on ne lui fait confiance sur aucun champ. Une valeur du mauvais
 * type est remplacée par sa valeur par défaut au lieu d'invalider tout le
 * reste, pour qu'une clé abîmée ne fasse pas perdre la progression.
 */
export function parseOnboardingProgress(
  raw: string | null,
): OnboardingProgress {
  if (!raw) {
    return EMPTY_PROGRESS;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY_PROGRESS;
  }

  if (typeof parsed !== "object" || parsed === null) {
    return EMPTY_PROGRESS;
  }

  const record = parsed as Record<string, unknown>;

  return {
    dismissed: record.dismissed === true,
    watchedSeconds: parseWatchedSeconds(record.watchedSeconds),
    lastTime: clampToVideo(record.lastTime),
  };
}

/**
 * Ne garde que les compteurs qui correspondent à un chapitre connu.
 *
 * Une vidéo réenregistrée renomme ses chapitres : les compteurs orphelins
 * doivent disparaître, sinon ils gonfleraient le total et retireraient la carte
 * à quelqu'un qui n'a pas vu la nouvelle version.
 */
function parseWatchedSeconds(value: unknown): Readonly<Record<string, number>> {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  const known = new Set(ONBOARDING_VIDEO.chapters.map((chapter) => chapter.id));
  const watched: Record<string, number> = {};

  for (const [id, seconds] of Object.entries(
    value as Record<string, unknown>,
  )) {
    if (known.has(id) && typeof seconds === "number" && seconds > 0) {
      watched[id] = Math.min(seconds, ONBOARDING_VIDEO.duration);
    }
  }

  return watched;
}

export function isOnboardingCompleted(progress: OnboardingProgress): boolean {
  return (
    totalWatchedSeconds(progress.watchedSeconds) >=
    ONBOARDING_VIDEO.duration * ONBOARDING_COMPLETION_RATIO
  );
}

/**
 * Le magasin, tenu hors de React.
 *
 * `useSyncExternalStore` réclame un instantané stable en référence : sans le
 * cache ci-dessous, chaque lecture renverrait un nouvel objet et React
 * boucherait indéfiniment. On ne reconstruit donc l'objet que lorsque la chaîne
 * stockée a réellement changé.
 */
let cachedRaw: string | null = null;
let cachedProgress: OnboardingProgress = EMPTY_PROGRESS;
let cachePrimed = false;

const listeners = new Set<() => void>();

/**
 * Une clé absente et un stockage refusé ne veulent pas dire la même chose : la
 * première est un premier passage, le second impose de se rabattre sur ce que
 * la session a en mémoire. Les confondre ferait oublier sa position au lecteur
 * à chaque rendu dans un Safari en navigation privée.
 */
type RawRead = { available: true; raw: string | null } | { available: false };

function readRaw(): RawRead {
  try {
    return {
      available: true,
      raw: window.localStorage.getItem(ONBOARDING_PROGRESS_STORAGE_KEY),
    };
  } catch {
    return { available: false };
  }
}

function getSnapshot(): OnboardingProgress {
  const read = readRaw();

  if (!read.available) {
    return cachedProgress;
  }

  if (!cachePrimed || read.raw !== cachedRaw) {
    cachedRaw = read.raw;
    cachedProgress = parseOnboardingProgress(read.raw);
    cachePrimed = true;
  }

  return cachedProgress;
}

/**
 * Rien n'est connu tant qu'on n'est pas dans le navigateur.
 *
 * Le serveur ne peut pas savoir si la carte a déjà été écartée. Renvoyer un
 * état par défaut ferait rendre la carte au serveur puis disparaître après
 * hydratation — un clignotement sur le premier écran, pour quelqu'un qui avait
 * précisément demandé à ne plus la voir. On renvoie `null`, l'appelant n'affiche
 * rien, et la vérité arrive juste après l'hydratation.
 */
function getServerSnapshot(): OnboardingProgress | null {
  return null;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // Un second onglet qui écarte la carte doit l'écarter ici aussi : sans ça,
  // celui resté ouvert la réafficherait à la navigation suivante.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === ONBOARDING_PROGRESS_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function writeProgress(next: OnboardingProgress) {
  try {
    window.localStorage.setItem(
      ONBOARDING_PROGRESS_STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    // Voir `readRaw` : on garde quand même la valeur en mémoire pour la durée
    // de la session, sinon le lecteur oublierait sa position à chaque rendu.
  }

  cachedRaw = JSON.stringify(next);
  cachedProgress = next;
  cachePrimed = true;

  for (const listener of listeners) {
    listener();
  }
}

function updateProgress(
  patch: (current: OnboardingProgress) => OnboardingProgress,
) {
  writeProgress(patch(getSnapshot()));
}

export type UseOnboardingProgress = {
  /** `null` tant que le navigateur n'a pas repris la main. */
  progress: OnboardingProgress | null;
  /** La présentation a été regardée pour l'essentiel. */
  hasWatchedOnboarding: boolean;
  /** La carte d'accueil a lieu d'être affichée. */
  shouldPromptOnboarding: boolean;
  dismiss: () => void;
  reopen: () => void;
  saveProgress: (
    currentTime: number,
    /** Secondes lues depuis la dernière écriture, par chapitre. */
    watchedDelta?: Record<string, number>,
  ) => void;
};

export function useOnboardingProgress(): UseOnboardingProgress {
  const progress = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const dismiss = useCallback(() => {
    updateProgress((current) => ({ ...current, dismissed: true }));
  }, []);

  const reopen = useCallback(() => {
    updateProgress((current) => ({ ...current, dismissed: false }));
  }, []);

  /**
   * Écrit la position, et ajoute les secondes lues depuis la dernière écriture.
   *
   * `watchedDelta` est un ajout, pas un état : le lecteur n'a pas à connaître
   * le total déjà accumulé, et deux onglets qui regardent la même présentation
   * ne s'écrasent donc pas l'un l'autre.
   */
  const saveProgress = useCallback(
    (currentTime: number, watchedDelta: Record<string, number> = {}) => {
      const time = clampToVideo(currentTime);

      updateProgress((current) => {
        const watchedSeconds = { ...current.watchedSeconds };

        for (const [id, seconds] of Object.entries(watchedDelta)) {
          if (seconds > 0) {
            watchedSeconds[id] = (watchedSeconds[id] ?? 0) + seconds;
          }
        }

        return { ...current, lastTime: time, watchedSeconds };
      });
    },
    [],
  );

  const hasWatchedOnboarding = progress
    ? isOnboardingCompleted(progress)
    : false;

  return {
    progress,
    hasWatchedOnboarding,
    shouldPromptOnboarding: progress
      ? !progress.dismissed && !hasWatchedOnboarding
      : false,
    dismiss,
    reopen,
    saveProgress,
  };
}
