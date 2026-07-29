/** Les chapitres du récit, dans l'ordre de lecture.
 *
 *  Source unique pour trois usages : l'ancrage des sections, le rail
 *  de progression, et la navigation.
 *
 *  `label` est descriptif — il a la place de l'être dans le rail et
 *  dans le menu mobile. `short` est la version qui tient dans une
 *  barre de navigation de 72px sans l'engorger. */
export const CHAPTERS = [
  { id: "lecture", label: "Ce que le propriétaire lit", short: "Le compte rendu" },
  { id: "atelier", label: "De vos notes au document", short: "La transformation" },
  { id: "controle", label: "Vous gardez la main", short: "Votre contrôle" },
  { id: "suivi", label: "Après la séance", short: "Le suivi" },
  { id: "tarifs", label: "Tarifs", short: "Tarifs" },
] as const;

/** Prise de rendez-vous pour la démonstration gratuite (CTA secondaire). */
export const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";

/** Mention de réassurance — reprise telle quelle de l'offre réelle. */
export const TRIAL_NOTE = "15 jours gratuits, sans carte bancaire";
