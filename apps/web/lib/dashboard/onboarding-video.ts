/**
 * La présentation vidéo de Biume, décrite une seule fois.
 *
 * La vidéo dure plus de sept minutes : personne ne la regarde d'un trait au
 * moment où il découvre le produit. Le découpage en chapitres est donc ce qui
 * la rend utilisable — on revient dessus depuis la page où l'on bloque et on
 * saute au passage correspondant. Les intitulés reprennent volontairement ceux
 * de la barre latérale : c'est le repère que le praticien a déjà sous les yeux.
 *
 * Les bornes ci-dessous ont été relevées dans la vidéo elle-même, pas
 * estimées. Si la vidéo est réenregistrée, c'est ici — et seulement ici —
 * qu'il faut les reprendre, avec `duration`.
 */

export type OnboardingChapter = {
  id: string;
  label: string;
  /** Ce que le chapitre montre, affiché sous son intitulé dans le lecteur. */
  summary: string;
  /** Début du chapitre, en secondes depuis le début de la vidéo. */
  startsAt: number;
};

export type OnboardingChapterSegment = OnboardingChapter & {
  /** Fin du chapitre : le début du suivant, ou la fin de la vidéo. */
  endsAt: number;
  duration: number;
  /** Position et largeur du segment dans la barre, en fraction de sa largeur. */
  offsetRatio: number;
  widthRatio: number;
};

export const ONBOARDING_VIDEO = {
  /** Durée réelle du fichier, en secondes (7 min 38). */
  duration: 458,
  poster: "/onboarding/presentation-poster.jpg",
  chapters: [
    {
      id: "overview",
      label: "Vue d'ensemble",
      summary:
        "Les séances du jour, les comptes rendus à traiter et les signaux d'activité.",
      startsAt: 0,
    },
    {
      id: "agenda",
      label: "L'agenda",
      summary:
        "Le calendrier du mois, la journée sélectionnée et les prochains rendez-vous.",
      startsAt: 64,
    },
    {
      id: "clients",
      label: "Clients & propriétaires",
      summary:
        "Le répertoire des propriétaires, leurs coordonnées et la création d'une fiche.",
      startsAt: 98,
    },
    {
      id: "patients",
      label: "Patients",
      summary:
        "Les animaux suivis, la création d'un patient et son dossier médical.",
      startsAt: 146,
    },
    {
      id: "appointment",
      label: "Planifier une séance",
      summary:
        "Créer un rendez-vous au cabinet ou à domicile, et préparer son compte rendu.",
      startsAt: 228,
    },
    {
      id: "reports",
      label: "Comptes rendus",
      summary:
        "La bibliothèque des rapports, le filtre par statut et l'édition d'une séance.",
      startsAt: 332,
    },
    {
      id: "settings",
      label: "Réglages & abonnement",
      summary:
        "L'identité de l'espace, la vulgarisation IA et l'historique de facturation.",
      startsAt: 396,
    },
  ] satisfies OnboardingChapter[],
} as const;

/**
 * La part de la vidéo à partir de laquelle on considère la présentation vue.
 *
 * Pas 100 % : la fin est un remerciement, et attendre la dernière seconde
 * ferait réapparaître la carte à quelqu'un qui a tout regardé.
 */
export const ONBOARDING_COMPLETION_RATIO = 0.9;

/**
 * L'URL du fichier, servie par UploadThing.
 *
 * Next remplace `process.env.NEXT_PUBLIC_*` à la compilation : l'accès doit
 * rester écrit en toutes lettres, sans destructuration ni indexation
 * dynamique, sinon la valeur est `undefined` côté navigateur.
 */
export function getOnboardingVideoUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_ONBOARDING_VIDEO_URL?.trim();

  return url ? url : undefined;
}

const clampToVideo = (seconds: number) => {
  if (!Number.isFinite(seconds)) {
    return 0;
  }

  return Math.min(Math.max(seconds, 0), ONBOARDING_VIDEO.duration);
};

/**
 * Les chapitres augmentés de leur géométrie dans la barre de progression.
 *
 * Les segments sont dimensionnés à la durée réelle de chaque chapitre, pas en
 * parts égales : une barre à sept pavés identiques mentirait sur l'endroit où
 * l'on se trouve dès qu'on la relit pour se repérer.
 */
export function buildChapterSegments(): OnboardingChapterSegment[] {
  const { chapters, duration } = ONBOARDING_VIDEO;

  return chapters.map((chapter, index) => {
    const endsAt = chapters[index + 1]?.startsAt ?? duration;

    return {
      ...chapter,
      endsAt,
      duration: endsAt - chapter.startsAt,
      offsetRatio: chapter.startsAt / duration,
      widthRatio: (endsAt - chapter.startsAt) / duration,
    };
  });
}

/**
 * Le chapitre en cours à un instant donné.
 *
 * Renvoie toujours un index valide, y compris avant que l'élément `<video>`
 * ait chargé ses métadonnées — il rapporte alors `NaN`.
 */
export function resolveActiveChapterIndex(currentTime: number): number {
  const time = clampToVideo(currentTime);
  const { chapters } = ONBOARDING_VIDEO;

  for (let index = chapters.length - 1; index >= 0; index -= 1) {
    if (time >= chapters[index]!.startsAt) {
      return index;
    }
  }

  return 0;
}

/**
 * La part d'un chapitre qu'il faut avoir lue pour le dire vu.
 *
 * Pas 100 % : une seconde manquante sur un raccord ne doit pas empêcher la
 * coche, et `timeupdate` n'échantillonne pas assez finement pour la garantir.
 */
export const CHAPTER_WATCHED_RATIO = 0.9;

/**
 * Un chapitre n'est coché que si on l'a vraiment lu.
 *
 * On compte les secondes effectivement jouées dans ce chapitre, pas le point le
 * plus loin atteint : sauter directement au chapitre 5 ne doit pas cocher les
 * quatre premiers, qui n'ont jamais été regardés. Revenir en arrière ne
 * décoche rien pour autant — les secondes déjà comptées le restent.
 */
export function isChapterWatched(
  segment: OnboardingChapterSegment,
  watchedSeconds: Readonly<Record<string, number>>,
): boolean {
  const seen = watchedSeconds[segment.id] ?? 0;

  return seen >= segment.duration * CHAPTER_WATCHED_RATIO;
}

/**
 * Le total réellement regardé, chapitre par chapitre.
 *
 * Chaque compteur est plafonné à la durée de son chapitre : repasser trois fois
 * sur l'agenda ne doit pas faire croire que la présentation entière a été vue.
 */
export function totalWatchedSeconds(
  watchedSeconds: Readonly<Record<string, number>>,
): number {
  return buildChapterSegments().reduce(
    (total, segment) =>
      total + Math.min(watchedSeconds[segment.id] ?? 0, segment.duration),
    0,
  );
}

/**
 * La durée telle qu'on la dit, pas telle qu'on la lit sur un lecteur.
 *
 * « 7:38 » est un repère de position : dans une phrase (« une visite guidée de
 * 7:38 »), il se lit comme une heure. En prose, on écrit « 7 min 38 ».
 */
export function formatDuration(seconds: number): string {
  const total = Math.floor(Number.isFinite(seconds) ? Math.max(seconds, 0) : 0);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;

  if (minutes === 0) {
    return `${remainder} s`;
  }

  return remainder === 0
    ? `${minutes} min`
    : `${minutes} min ${String(remainder).padStart(2, "0")}`;
}

export function formatTimecode(seconds: number): string {
  const total = Math.floor(Number.isFinite(seconds) ? Math.max(seconds, 0) : 0);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
