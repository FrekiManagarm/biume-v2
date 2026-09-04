/**
 * Source unique du texte de landing-v5. Aucune preuve inventée : pas de
 * témoignage, pas de compteur d'utilisateurs, pas de logo partenaire. La
 * seule démonstration autorisée est le produit lui-même, étiquetée comme
 * telle. La promesse chiffrée "en moins de cinq minutes" n'apparaît nulle
 * part (réservée à un contexte testé, cf. PRODUCT.md).
 *
 * Le bandeau de contextes de pratique (TRADES) reste centré sur
 * l'ostéopathie animalière elle-même (équin, canin, félin...) et ne nomme
 * jamais d'autre profession — PRODUCT.md : "Le marketing nomme
 * explicitement les ostéopathes animaliers [...] ils ne doivent pas diluer
 * le message initial."
 */

export const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";
export const TRIAL_NOTE =
  "15 jours d'essai · sans carte bancaire · résiliable à tout moment";

export const NAV_LINKS = [
  { href: "#produit", label: "Compte rendu" },
  { href: "#fonctions", label: "Fonctions" },
  { href: "#atelier", label: "Atelier" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#questions", label: "Questions" },
] as const;

/* ── Hero ──────────────────────────────────────────────────────── */

export const HERO_PILL_BADGE = "Nouveau";
export const HERO_PILL_TEXT =
  "Le compte rendu propriétaire de l'ostéopathe animalier";

export const HERO_TITLE_LINE_1 = "Vos notes de praticien animalier,";
export const HERO_TITLE_LINE_2 = "un compte rendu prêt à envoyer.";

export const HERO_LEAD =
  "Biume reprend vos abréviations telles quelles et en tire un document que le propriétaire comprend. Vous relisez, vous validez, vous envoyez — en quelques minutes, à la fin de la séance.";

export const HERO_CTA_PRIMARY = "Commencer l'essai gratuit";
export const HERO_CTA_SECONDARY = "Voir un compte rendu";

export const HERO_MOCK = {
  subject: "Iron · jument, 11 ans",
  subtitle: "Séance du 14 mars · 10:30 · Écurie du Val",
  sendLabel: "Envoyer au propriétaire",
  nav: [
    { label: "Agenda" },
    { label: "Comptes rendus", active: true, badge: "1" },
    { label: "Dossiers" },
    { label: "Suivi" },
    { label: "Réglages" },
  ],
  rawLabel: "Vos notes",
  raw: "palp : tension chaîne thoraco-lombaire G>D, restriction D14-L1 · suites : repos actif 48 h, revoir J+21",
  outLabel: "Compte rendu propriétaire",
  outStatus: "Validé",
  out: [
    "J'ai trouvé une zone de tension le long du dos, plus marquée à gauche, ainsi qu'une articulation du bas du dos qui bougeait moins bien que la normale.",
    "Pendant 48 heures, laissez-la bouger librement au pré, sans travail monté. Je la revois dans trois semaines.",
  ],
  statusBarLeft: "4 sections relues",
  statusBarRight: "Prêt à envoyer",
} as const;

/**
 * Reprend, sous forme de schéma corporel, les zones déjà nommées dans les
 * notes de la même séance : HERO_MOCK.raw ("tension chaîne thoraco-lombaire
 * G>D") et SPECIMEN_STEPS[1].raw ("sacro-iliaque D sensible") — aucune
 * donnée clinique inventée pour ce widget.
 */
export const HERO_ANATOMY_MOCK = {
  label: "Schéma corporel",
  zones: [
    { label: "Thoraco-lombaire", note: "Tension" },
    { label: "Sacro-iliaque", note: "Sensible" },
  ],
} as const;

/**
 * Maquette du module de rapports de l'application praticien, relevée sur
 * l'écran réel (`apps/web/src/components/dashboard/pages/reports-module/`,
 * route `/dashboard/reports/$id/edit`). Libellés, états et compteurs sont
 * ceux du code : `professionalStateLabel`, `ownerStatusPresentation`, les
 * quatre onglets, `SectionDecisionControl` et `OwnerPreparationSheet`.
 *
 * Le panneau « Préparation guidée » est ouvert parce que c'est là que se
 * joue la promesse du hero : le texte professionnel reste intact à gauche,
 * la version propriétaire s'écrit à droite.
 *
 * La séance est celle de `HERO_MOCK` — Iron — dont le propriétaire porte
 * le nom déjà utilisé par le board mobile, pour n'en inventer aucun.
 */
export const WEB_MOCK_REPORT = {
  url: "app.biume.com/dashboard/reports/iron/edit",

  sidebarTitle: "Compte rendu",
  sidebarProgress: "50% complété",
  sidebarTabs: [
    {
      label: "Observations",
      count: "3",
      state: "À confirmer",
      owner: "À préparer",
      active: false,
    },
    {
      label: "Anatomie",
      count: "2",
      state: "Confirmé",
      owner: "Prêt",
      active: true,
    },
    {
      label: "Recommandations",
      count: "2",
      state: "Confirmé",
      owner: "Prêt",
      active: false,
    },
    {
      label: "Notes additionnelles",
      count: "0",
      state: "À renseigner",
      owner: null,
      active: false,
    },
  ],
  sidebarPrepare: "3 contenus à préparer",

  title: "Compte rendu — Iron",
  patient: ["Iron", "Cheval", "Claire Lambert"],
  appointment: "sam. 14 mars · 10:30–11:15",
  preview: "Aperçu",
  save: "Sauvegarder",
  finalize: "Finaliser",

  decisionConfirm: "Confirmer la section",
  decisionDismiss: "Marquer non applicable",

  /* Onglet Anatomie : le canevas et ses deux barres flottantes, telles
     qu'`AnatomicalEvaluationTab` les pose — les vues à droite, les outils à
     gauche. Les deux zones colorées sont celles que les notes de la séance
     nomment déjà (cf. HERO_ANATOMY_MOCK). */
  anatomyViews: ["Vue gauche", "Vue droite"],
  anatomyHelp: "Aide",
  anatomyElements: "Éléments",
  anatomyElementsCount: "2",
  anatomyAdd: "Ajouter",
  anatomyAddKey: "N",
} as const;

/* ── Bandeau de contextes de pratique ─────────────────────────── */

export const TRADES = {
  lead: "Pensé pour tous les contextes de l'ostéopathie animalière",
  items: [
    "Équin",
    "Canin",
    "Félin",
    "Sportif",
    "Rural",
    "NAC",
    "Itinérant",
    "Cabinet fixe",
  ],
} as const;

/* ── Le constat ────────────────────────────────────────────────── */

export const FACTS_EYEBROW = "Le constat";
export const FACTS_TITLE = "La séance finit dans la voiture.";
export const FACTS_LEAD =
  "Ce n'est pas un problème d'organisation. C'est la forme du métier d'ostéopathe animalier — et c'est là que le temps part.";

export const FACTS = [
  {
    n: "01",
    title: "Le compte rendu se rédige le soir.",
    body: "Entre deux rendez-vous, sur un téléphone, après la dernière séance. Jamais au moment où le geste est encore frais.",
  },
  {
    n: "02",
    title: "Vos notes ne sont pas faites pour être lues.",
    body: "Elles sont faites pour être écrites vite et vous servir à vous. Envoyées telles quelles, le propriétaire ne peut pas les interpréter.",
  },
  {
    n: "03",
    title: "Les reformuler prend le temps d'une séance.",
    body: "Traduire vingt lignes techniques en un document lisible demande vingt à trente minutes. Multipliées par la semaine.",
  },
] as const;

/* ── La solution (bento) ──────────────────────────────────────── */

export const BENTO_EYEBROW = "La solution";
export const BENTO_TITLE = "Un seul objet, traité de bout en bout.";
export const BENTO_LEAD =
  "Biume ne cherche pas à remplacer votre gestion. Il prend le compte rendu propriétaire et tout ce qui en découle.";

export const BENTO_NOTES_TO_DOC = {
  title: "Vos notes deviennent un document lisible",
  body: "Abréviations, sigles, ordre libre : Biume repart de votre formulation et la traduit sans rien inventer. Le vocabulaire technique est expliqué, pas effacé.",
  raw: "palp : tension T-L G>D, restriction D14-L1",
  out: "Une zone de tension le long du dos, plus marquée à gauche, et une articulation du bas du dos moins mobile que la normale.",
} as const;

export const BENTO_VALIDATION = {
  title: "Vous validez passage par passage",
  body: "Rien ne part sans votre clic. Chaque paragraphe est proposé à côté de votre note d'origine.",
  rows: [
    { label: "Motif", status: "validé", tone: "green" },
    { label: "Examen", status: "validé", tone: "green" },
    { label: "Traitement", status: "à relire", tone: "violet" },
  ],
} as const;

export const BENTO_OWNER = {
  title: "Le propriétaire lit sur son téléphone",
  body: "Un lien sécurisé, un code à usage unique. Rien à installer, aucun compte à créer.",
  cardLabel: "Lien sécurisé",
  cardMessage: "Le compte rendu d'Iron est disponible.",
} as const;

export const BENTO_FOLLOW_UP = {
  title: "Le suivi se déclenche tout seul",
  body: "Le questionnaire à J+2 et le contrôle daté sortent des suites que vous avez écrites. Seules les réponses qui demandent une action vous sont signalées.",
  rows: [
    { when: "J+0", label: "Compte rendu envoyé" },
    { when: "J+2", label: "Questionnaire de suivi" },
    { when: "J+21", label: "Contrôle dans votre agenda" },
  ],
} as const;

/* ── Le compte rendu (onglets) ────────────────────────────────── */

export const TABS_EYEBROW = "Le compte rendu";
export const TABS_TITLE = "Le même relevé, écrit deux fois.";
export const TABS_LEAD =
  "À gauche, vos notes. À droite, ce que le propriétaire reçoit. Passez d'un temps de la séance à l'autre.";
export const TABS_SUBJECT = "Iron · jument selle français · 11 ans";
export const TABS_NOTE =
  "Séance fictive, écrite pour la démonstration. Aucun dossier réel n'est utilisé sur cette page.";

export const SPECIMEN_STEPS = [
  {
    id: "motif",
    label: "Motif",
    heading: "Ce que vous notez en arrivant.",
    raw: "mot : raideur post-transport, refus incurvation D, prop. signale gêne dep. 3 sem",
    out: "Vous m'avez appelé parce qu'Iron semblait gênée depuis environ trois semaines, en particulier depuis son dernier transport. À l'examen, elle avait effectivement du mal à s'incurver du côté droit.",
  },
  {
    id: "examen",
    label: "Examen",
    heading: "Le vocabulaire technique est traduit, pas effacé.",
    raw: "palp : tension chaîne thoraco-lombaire G>D, restriction D14-L1, sacro-iliaque D sensible",
    out: "J'ai trouvé une zone de tension le long du dos, plus marquée à gauche, ainsi qu'une articulation du bas du dos et le bassin droit qui bougeaient moins bien que la normale.",
  },
  {
    id: "traitement",
    label: "Traitement",
    heading: "Ce que vous avez fait, dit en clair.",
    raw: "ttt : tech. myotensives chaîne dorsale, mobilisation SI D, relâchement diaphragme",
    out: "J'ai travaillé en douceur sur les muscles du dos, remis en mouvement le bassin droit, puis relâché le diaphragme qui participait à la raideur.",
  },
  {
    id: "suites",
    label: "Suites",
    heading: "Les consignes deviennent des dates.",
    raw: "suites : repos actif 48 h, pas de cercle 5 j, revoir J+21",
    out: "Pendant 48 heures, laissez-la bouger librement au pré, sans travail monté. Évitez le travail en cercle pendant cinq jours. Je la revois dans trois semaines.",
  },
] as const;

/* ── L'atelier (poste de travail) ─────────────────────────────── */

export const ATELIER_EYEBROW = "Le module de rédaction";
export const ATELIER_TITLE = "Chaque compte rendu a son poste de travail.";
export const ATELIER_LEAD =
  "Quatre sections suivies une à une, un schéma corporel qui garde vos observations précises, l'historique de l'animal sous la main — tout reste au même endroit, du début à l'envoi.";

/**
 * Reprend l'écran réel du module (cf. `WEB_MOCK_REPORT`) : mêmes onglets,
 * mêmes compteurs, mêmes états. La tuile montre l'onglet Anatomie là où le
 * hero montre Observations — c'est le même compte rendu, un autre moment.
 */
export const ATELIER_WORKSPACE = {
  title: "Quatre sections, un état par section",
  body: "Observations, anatomie, recommandations, notes : chaque section garde son propre statut, et « Finaliser » attend les quatre.",
  url: "app.biume.com/dashboard/reports/iron/edit",
  sidebarTitle: "Compte rendu",
  progressLabel: "50% complété",
  sections: [
    {
      label: "Observations",
      count: "3",
      state: "needs_confirmation",
      owner: "À préparer",
      active: false,
    },
    {
      label: "Anatomie",
      count: "2",
      state: "confirmed",
      owner: "Prêt",
      active: true,
    },
    {
      label: "Recommandations",
      count: "2",
      state: "confirmed",
      owner: "Prêt",
      active: false,
    },
    {
      label: "Notes additionnelles",
      count: "0",
      state: "empty",
      owner: null,
      active: false,
    },
  ],
  prepare: "3 contenus à préparer",
  anatomyLabel: "Schéma corporel",
  anatomyZone: "Thoraco-lombaire",
  anatomySide: "Côté gauche",
  anatomySeverity: "Très marquée",
  decisionConfirm: "Confirmer la section",
  decisionDismiss: "Marquer non applicable",
} as const;

export const ATELIER_HISTORY = {
  title: "L'historique reste sous la main",
  body: "Les séances précédentes de l'animal, avec la récurrence d'une même zone quand elle revient.",
  rows: [
    { when: "14 mars", label: "Tension thoraco-lombaire", recurrence: "Récurrence élevée" },
    { when: "18 févr.", label: "Sacro-iliaque sensible", recurrence: "Récurrence moyenne" },
    { when: "3 janv.", label: "Raideur post-transport", recurrence: "Récurrence faible" },
  ],
} as const;

/** Vocabulaire d'`OwnerPreparationSheet` : « Texte professionnel » d'un côté,
 *  « Version propriétaire » de l'autre, et le statut propriétaire à droite. */
export const ATELIER_VERSIONS = {
  title: "Deux écritures, un seul geste",
  body: "Le texte professionnel ne bouge pas ; la version propriétaire se prépare à côté, avec son propre statut.",
  practitioner: {
    label: "Texte professionnel",
    status: "Confirmé",
    extract: "Tension chaîne T-L G>D, restriction D14-L1.",
  },
  owner: {
    label: "Version propriétaire",
    status: "Prêt",
    extract: "Une zone de tension le long du dos, plus marquée à gauche.",
  },
} as const;

/* ── Fonctions (3 blocs) ──────────────────────────────────────── */

export const FEATURES_EYEBROW = "Fonctions";
export const FEATURES_TITLE = "Le geste ne change pas, ce qui suit oui.";

export const FEATURES = [
  {
    n: "01",
    title: "Vous notez comme d'habitude",
    body: "Abréviations, sigles, syntaxe télégraphique, ordre libre : Biume part de vos notes telles qu'elles sont.",
    link: "En savoir plus sur la prise de notes",
    panelLabel: "Vos notes",
    panelRaw: "mot : raideur post-transport, refus incurvation D",
    panelCta: "Générer le compte rendu",
  },
  {
    n: "02",
    title: "Vous relisez passage par passage",
    body: "Chaque passage est relu séparément et reste modifiable jusqu'à l'envoi. Rien ne part sans votre validation.",
    link: "En savoir plus sur la relecture",
    panelStates: ["Motif — Validé", "Examen — Validé", "Suites — À relire"],
    panelExtract:
      "Vous m'avez appelé parce qu'Iron semblait gênée depuis environ trois semaines.",
    panelActions: ["Corriger", "Valider"],
  },
  {
    n: "03",
    title: "Vous envoyez, le suivi démarre",
    body: "Une fois validé, le document part au propriétaire. Le questionnaire de suivi et le rappel de contrôle se programment tout seuls.",
    link: "En savoir plus sur le suivi",
    panelStatus: "Envoyé · 14:02",
    panelFollowUp: "Questionnaire programmé · J+2",
    panelControl: "Contrôle du 4 avril",
  },
] as const;

/* ── Mobile (arc de téléphones) ───────────────────────────────── */

export const MOBILE_EYEBROW = "Sur le terrain";
export const MOBILE_TITLE = "Votre activité tient dans une poche.";
export const MOBILE_LEAD =
  "Les rendez-vous du jour et le compte rendu prêt à envoyer tiennent sur l'écran que vous avez déjà en main.";

/**
 * Contenu des maquettes de l'application mobile. Repris mot pour mot du board
 * de remise (`handoff/Biume Mobile.html`) : c'est le produit qui se montre
 * lui-même, aucune donnée clinique n'est ajoutée ici.
 */
export const APP_MOCK_HOME = {
  initials: "CM",
  date: "Mardi 8 septembre",
  practitioner: "Camille Marchand",
  inboxTitle: "À traiter",
  inboxCount: "2",
  inbox: [
    {
      tag: "Compte rendu à terminer",
      tone: "violet",
      when: "il y a 40 min",
      subject: "Iron",
      detail: "Mme Lambert · 4 propositions à vérifier",
    },
    {
      tag: "Réponse au suivi",
      tone: "green",
      when: "hier",
      subject: "Naya",
      detail: "Mme Perrot · « elle boite encore un peu »",
    },
  ],
  agendaTitle: "Aujourd'hui",
  agendaAside: "8 jours",
  agenda: [
    {
      time: "14:00",
      subject: "Iron · Selle français",
      place: "Écurie des Pins, Rambouillet",
      now: "Maintenant",
    },
    {
      time: "15:30",
      subject: "Vega · Selle français",
      place: "M. Dubreuil, Gazeran",
      now: null,
    },
    {
      time: "17:15",
      subject: "Naya · Border collie",
      place: "Mme Perrot, Cernay",
      now: null,
    },
  ],
  action: "Dicter une séance",
} as const;

export const APP_MOCK_FINALIZE = {
  title: "Finaliser",
  checked: "7 sections validées",
  subject: "Iron",
  session: "Séance du 8 septembre · 4 min 32 de dictée",
  recipientLabel: "Destinataire",
  recipientInitials: "CL",
  recipientName: "Claire Lambert",
  recipientMail: "claire.lambert@mail.fr",
  edit: "Modifier",
  attachTitle: "Joindre les recommandations",
  attachDetail: "Deux semaines sans saut",
  // L'irréversible est annoncé avant le geste, jamais après.
  warning:
    "Une fois envoyé, le compte rendu n'est plus modifiable depuis le mobile. Le propriétaire reçoit un PDF signé.",
  action: "Finaliser et envoyer",
  secondary: "Finaliser sans envoyer",
} as const;

export const APP_MOCK_REPORT = {
  title: "Compte rendu",
  subtitle: "Iron · Mme Lambert",
  progressLabel: "3 propositions vérifiées sur 7",
  progressValue: "43 %",
  progressRatio: 43,
  observationsLabel: "Observations",
  observationsStatus: "À vérifier",
  proposal:
    "Restriction de mobilité de la charnière lombo-sacrée, avec sensibilité modérée en regard de L7.",
  quoteLabel: "Dit à 02:14",
  quote:
    "« À la palpation, restriction de mobilité sur la charnière lombo-sacrée… »",
  accept: "Valider",
  dismiss: "Sans objet",
  settled: "Bassin équilibré, pas d'asymétrie franche à l'observation statique.",
  settledStatus: "Validé",
  recommendationsLabel: "Recommandations",
  recommendation: "Deux semaines sans saut, reprise progressive du travail.",
  recommendationRest: "2 propositions restantes dans cette section",
  action: "Terminer — 4 à vérifier",
} as const;

export const MOBILE_PERIMETER = [
  {
    title: "Agenda et rendez-vous",
    body: "Les séances du jour, à déplacer ou à clôturer.",
  },
  {
    title: "Dossiers en deux champs",
    body: "Un propriétaire et un animal créés en deux champs, complétés au fil des séances.",
  },
  {
    title: "PDF et envoi par e-mail",
    body: "Le document part à votre nom, avec votre mise en page.",
  },
] as const;

/* ── Côté propriétaire ────────────────────────────────────────── */

export const OWNER_EYEBROW = "Côté propriétaire";
export const OWNER_TITLE = "Il n'installe rien, il ne crée pas de compte.";
export const OWNER_LEAD =
  "Le propriétaire ouvre un lien sécurisé depuis son téléphone. Il confirme son identité par un code à usage unique la première fois, puis reste connecté trente jours sur cet appareil.";

export const OWNER_POINTS = [
  "Il lit le compte rendu, mis en page pour un écran de téléphone.",
  "Il répond au questionnaire de suivi en trois questions.",
  "Il demande explicitement à être recontacté, s'il le souhaite.",
] as const;

export const OWNER_MOCK_LINK = {
  label: "Lien sécurisé",
  message: "Le compte rendu d'Iron est disponible.",
  codeLabel: "Code reçu par SMS",
  digits: ["4", "1", "8", ""],
  cta: "Voir le compte rendu",
} as const;

export const OWNER_MOCK_FOLLOWUP = {
  label: "Suivi · J+2",
  question: "Comment va Iron depuis la séance ?",
  answers: ["Mieux qu'avant", "Nettement mieux", "Sans changement"],
  selectedIndex: 1,
  note: "Seules les réponses qui demandent une action vous sont signalées.",
} as const;

/* ── Le suivi ──────────────────────────────────────────────────── */

export const FOLLOW_UP_EYEBROW = "Le suivi";
export const FOLLOW_UP_TITLE = "La séance continue sans que vous y pensiez.";

export const FOLLOW_UP = [
  {
    when: "J+0",
    title: "Le compte rendu part",
    body: "Une fois que vous l'avez validé, et pas avant. Le propriétaire le reçoit en PDF, mis en page pour être lu sur un téléphone.",
  },
  {
    when: "J+2",
    title: "Vous demandez des nouvelles",
    body: "Un questionnaire court, préparé à partir des suites que vous avez écrites : comment l'animal a évolué, ce qui a été observé, si le propriétaire souhaite être recontacté.",
  },
  {
    when: "J+21",
    title: "Le contrôle revient dans votre semaine",
    body: "La date notée en fin de séance ressort d'elle-même, avec le compte rendu attaché. Et seules les réponses qui demandent une action vous sont signalées.",
  },
] as const;

/* ── Ce que Biume ne fait pas ──────────────────────────────────── */

export const BOUNDARIES_TITLE = "Ce que Biume ne fait pas.";

export const BOUNDARIES = [
  "Biume ne pose aucun diagnostic et ne propose aucun protocole de traitement.",
  "Biume n'écrit aucune observation qui ne soit pas déjà dans vos notes.",
  "Aucun document ne part sans que vous ayez cliqué sur envoyer.",
  "Biume ne remplace ni votre logiciel de gestion, ni votre facturation.",
  "Vos dossiers vous appartiennent : export complet, à tout moment, sans conditions.",
] as const;

/* ── Tarifs ────────────────────────────────────────────────────── */

export const PRICING_EYEBROW = "Tarifs";
export const PRICING_TITLE = "Une formule, deux rythmes.";
export const PRICING_LEAD =
  "Facturé par praticien. Pas par compte rendu, pas par message envoyé.";

export const PRICING_PLAN = {
  monthly: { price: "29,99 €", note: "Sans engagement · résiliable à tout moment" },
  annual: {
    price: "24,99 €",
    note: "Facturé 299,88 € par an · deux mois offerts",
  },
  badge: "Le plus choisi",
  included: [
    "Compte rendu propriétaire à partir de vos notes",
    "Relecture et validation passage par passage",
    "Export PDF, mis en page pour la lecture mobile",
    "Questionnaire de suivi et rappels de contrôle",
    "Dossiers illimités, export complet à tout moment",
  ],
  cta: TRIAL_NOTE,
  ctaLabel: "Commencer l'essai gratuit",
} as const;

export const PRICING_DEMO_CARD = {
  title: "Accompagné · Sur rendez-vous",
  body: "Trente minutes, votre dernière séance comme exemple, et vous repartez avec un compte rendu prêt à envoyer.",
  cta: "Réserver une démonstration",
} as const;

/* ── Questions ─────────────────────────────────────────────────── */

export const FAQ_TITLE = "Questions fréquentes.";
export const FAQ_CONTACT = "Une autre question ? Écrivez à contact@biume.com.";

export const FAQ = [
  {
    q: "Est-ce que Biume écrit à ma place ?",
    a: "Non. Biume reformule ce que vous avez écrit pour le rendre lisible par le propriétaire. Il n'ajoute aucune observation, aucun constat et aucune recommandation qui ne soit pas dans vos notes. Vous relisez chaque passage avant que le document existe.",
  },
  {
    q: "Que se passe-t-il si la reformulation est inexacte ?",
    a: "Vous la corrigez sur place, passage par passage. Le texte reste éditable jusqu'à l'envoi, et le compte rendu ne quitte jamais votre écran tant que vous ne l'avez pas validé.",
  },
  {
    q: "Faut-il changer ma façon de prendre des notes ?",
    a: "Non, et c'est le point de départ du produit. Abréviations, sigles, syntaxe télégraphique, ordre libre : Biume est fait pour partir de ça. Si vos notes vous suffisent aujourd'hui, elles suffiront à Biume.",
  },
  {
    q: "Biume remplace-t-il mon logiciel de gestion ?",
    a: "Non. Biume s'occupe du compte rendu propriétaire et de ce qui vient après la séance. Votre agenda, votre facturation et votre comptabilité restent où ils sont.",
  },
  {
    q: "Où sont hébergées les données ?",
    a: "En Europe. Vous pouvez exporter l'intégralité de vos dossiers à tout moment depuis les paramètres, et la suppression du compte supprime les données associées.",
  },
  {
    q: "Comment se passe l'essai ?",
    a: "Quinze jours, sans carte bancaire, avec toutes les fonctionnalités. À la fin, vous choisissez de continuer ou non — il n'y a rien à résilier si vous ne faites rien.",
  },
] as const;

/* ── Clôture ───────────────────────────────────────────────────── */

export const CLOSE_TITLE = "Votre prochaine séance peut être la première.";
export const CLOSE_LEAD =
  "Prenez vos notes comme d'habitude. Regardez ce que Biume en fait. Décidez ensuite.";
export const CLOSE_CTA_PRIMARY = "Commencer l'essai gratuit";
export const CLOSE_CTA_SECONDARY = "Réserver une démonstration";

/* ── Footer ────────────────────────────────────────────────────── */

export const FOOTER_COLUMNS = [
  {
    title: "Le métier",
    links: [
      { href: "/logiciel-osteopathe-animalier", label: "Logiciel ostéopathe animalier" },
      {
        href: "/modele-compte-rendu-osteopathe-animalier",
        label: "Modèle de compte rendu",
      },
      {
        href: "/exemple-compte-rendu-osteopathie-animale",
        label: "Exemple de compte rendu",
      },
      { href: "/suivi-post-seance-animal", label: "Suivi post-séance" },
      { href: "/relance-client-osteopathe-animalier", label: "Relance client" },
    ],
  },
  {
    title: "Comparer",
    links: [
      { href: "/comparatifs", label: "Tous les comparatifs" },
      { href: "/comparatifs/neovoice-vs-biume", label: "Neovoice vs Biume" },
      { href: "/alternatives/kiwiappli", label: "Alternative à Kiwiappli" },
      { href: "/alternatives/animalib", label: "Alternative à Animalib" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Biume",
    links: [
      { href: "/about", label: "À propos" },
      { href: "/tarifs", label: "Tarifs" },
      { href: "/cgu", label: "CGU" },
      { href: "/privacy", label: "Confidentialité" },
    ],
  },
] as const;

export const FOOTER_LINE = "© 2026 Biume · Données hébergées en Europe";
