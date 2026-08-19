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
  { href: "#compte-rendu", label: "Compte rendu" },
  { href: "#fonctions", label: "Fonctions" },
  { href: "#mobile", label: "Mobile" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#questions", label: "Questions" },
] as const;

/* ── Hero ──────────────────────────────────────────────────────── */

export const HERO_PILL_BADGE = "Nouveau";
export const HERO_PILL_TEXT = "Le compte rendu propriétaire, écrit depuis vos notes";

export const HERO_TITLE_LINE_1 = "Vos notes de séance,";
export const HERO_TITLE_LINE_2 = "un compte rendu prêt à envoyer.";

export const HERO_LEAD =
  "Vous notez comme vous avez toujours noté : abrégé, technique, rapide. Biume met en forme pour le propriétaire. Vous relisez passage par passage, et rien ne part avant votre validation.";

export const HERO_CTA_PRIMARY = "Commencer l'essai gratuit";
export const HERO_CTA_SECONDARY = "Voir un compte rendu";

export const HERO_MOCK = {
  subject: "Nashira · jument, 11 ans",
  subtitle: "Séance du 12 mars · à finaliser",
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

export const HERO_PHONE_MOCK = {
  label: "Espace propriétaire",
  linkLabel: "Lien sécurisé",
  question: "Comment va Nashira depuis la séance ?",
  followUpLabel: "Suivi · J+2",
  cta: "Répondre",
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
  "Ce n'est pas un problème d'organisation. C'est la forme du métier — et c'est là que le temps part.";

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
export const BENTO_TITLE = "Un seul geste de plus : valider.";

export const BENTO_NOTES_TO_DOC = {
  title: "Vos notes deviennent un document lisible",
  rawLabel: "Vos notes",
  raw: "mot : raideur post-transport, refus incurvation D",
  outLabel: "Compte rendu",
  out: "Nashira semblait gênée depuis son dernier transport, avec une difficulté à s'incurver du côté droit.",
} as const;

export const BENTO_VALIDATION = {
  title: "Vous validez passage par passage",
  rows: [
    { label: "Motif de la séance", tone: "green" },
    { label: "Examen", tone: "green" },
    { label: "Suites de séance", tone: "violet" },
  ],
} as const;

export const BENTO_OWNER = {
  title: "Le propriétaire lit sur son téléphone",
  card: "Lien sécurisé",
} as const;

export const BENTO_FOLLOW_UP = {
  title: "Le suivi se déclenche tout seul",
  rows: [
    { when: "J+0", label: "Compte rendu envoyé" },
    { when: "J+2", label: "Question de suivi programmée" },
    { when: "J+21", label: "Contrôle rappelé" },
  ],
} as const;

/* ── Le compte rendu (onglets) ────────────────────────────────── */

export const TABS_EYEBROW = "Le compte rendu";
export const TABS_TITLE = "Le même relevé, écrit deux fois.";
export const TABS_LEAD =
  "À gauche, vos notes. À droite, ce que le propriétaire reçoit. Passez d'un temps de la séance à l'autre.";
export const TABS_SUBJECT = "Nashira · jument selle français · 11 ans";
export const TABS_NOTE =
  "Séance fictive, écrite pour la démonstration. Aucun dossier réel n'est utilisé sur cette page.";

export const SPECIMEN_STEPS = [
  {
    id: "motif",
    label: "Motif",
    heading: "Ce que vous notez en arrivant.",
    raw: "mot : raideur post-transport, refus incurvation D, prop. signale gêne dep. 3 sem",
    out: "Vous m'avez appelé parce que Nashira semblait gênée depuis environ trois semaines, en particulier depuis son dernier transport. À l'examen, elle avait effectivement du mal à s'incurver du côté droit.",
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

/* ── Fonctions (3 blocs) ──────────────────────────────────────── */

export const FEATURES_EYEBROW = "Fonctions";
export const FEATURES_TITLE = "Le geste ne change pas, ce qui suit oui.";

export const FEATURES = [
  {
    n: "01",
    title: "Vous notez comme d'habitude",
    body: "Abréviations, sigles, syntaxe télégraphique, ordre libre : Biume part de vos notes telles qu'elles sont.",
    link: "En savoir plus sur la prise de notes",
    phoneLabel: "Vos notes",
    phoneRaw: "mot : raideur post-transport, refus incurvation D",
    phoneCta: "Générer le compte rendu",
  },
  {
    n: "02",
    title: "Vous relisez passage par passage",
    body: "Chaque passage est relu séparément et reste modifiable jusqu'à l'envoi. Rien ne part sans votre validation.",
    link: "En savoir plus sur la relecture",
    phoneStates: ["Motif — Validé", "Examen — Validé", "Suites — À relire"],
    phoneExtract:
      "Vous m'avez appelé parce que Nashira semblait gênée depuis environ trois semaines.",
    phoneActions: ["Corriger", "Valider"],
  },
  {
    n: "03",
    title: "Vous envoyez, le suivi démarre",
    body: "Une fois validé, le document part au propriétaire. Le questionnaire de suivi et le rappel de contrôle se programment tout seuls.",
    link: "En savoir plus sur le suivi",
    phoneStatus: "Envoyé · 14:02",
    phoneFollowUp: "Questionnaire programmé · J+2",
    phoneControl: "Contrôle du 4 avril",
  },
] as const;

/* ── Mobile (arc de téléphones) ───────────────────────────────── */

export const MOBILE_EYEBROW = "Sur le terrain";
export const MOBILE_TITLE = "Le cabinet tient dans une poche.";
export const MOBILE_LEAD =
  "Les rendez-vous du jour, la séance à clôturer, le compte rendu prêt à envoyer — tout tient sur l'écran que vous avez déjà en main.";

export const MOBILE_SCREENS = [
  { label: "Agenda du jour" },
  { label: "Vos notes" },
  { label: "Compte rendu prêt à envoyer" },
  { label: "Suivi · J+2" },
  { label: "Historique" },
] as const;

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
    title: "Historique de l'animal",
    body: "Les comptes rendus précédents, disponibles pendant la séance.",
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
  message: "Le compte rendu de Nashira est disponible.",
  codeLabel: "Code reçu par SMS",
  digits: ["4", "1", "8", ""],
  cta: "Voir le compte rendu",
} as const;

export const OWNER_MOCK_FOLLOWUP = {
  label: "Suivi · J+2",
  question: "Comment va Nashira depuis la séance ?",
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

export const FAQ_TITLE = "Questions.";
export const FAQ_CONTACT = "D'autres questions ? Écrivez-nous, on répond vite.";

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
    title: "Produit",
    links: [
      { href: "#compte-rendu", label: "Le compte rendu" },
      { href: "#fonctions", label: "Fonctions" },
      { href: "#mobile", label: "Mobile" },
      { href: "#tarifs", label: "Tarifs" },
      { href: "#questions", label: "Questions" },
    ],
  },
  {
    title: "Métiers",
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
      { href: "/comparatifs", label: "Tous les comparatifs" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Société",
    links: [
      { href: "/about", label: "À propos" },
      { href: "/cgu", label: "CGU" },
      { href: "/privacy", label: "Confidentialité" },
    ],
  },
] as const;

export const FOOTER_LINE = "© 2026 Biume · Données hébergées en Europe";
