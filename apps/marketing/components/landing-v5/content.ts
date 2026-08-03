/**
 * Source unique du texte de landing-v5. Aucune preuve inventée : pas de
 * témoignage, pas de compteur d'utilisateurs, pas de logo partenaire.
 * La seule démonstration autorisée est le produit lui-même, étiquetée
 * comme telle. La promesse chiffrée "en moins de cinq minutes" n'apparaît
 * nulle part (interdite par PRODUCT.md avant validation terrain).
 */

export const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";
export const TRIAL_NOTE = "15 jours d'essai, sans carte bancaire";

export const NAV_LINKS = [
  { href: "#produit", label: "Le parcours" },
  { href: "#suivi", label: "Le suivi" },
  { href: "#proprietaire", label: "Le propriétaire" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#questions", label: "Questions" },
] as const;

/* ── Hero ──────────────────────────────────────────────────────── */

export const HERO_PILL = "Pour les ostéopathes et praticiens animaliers";

export const HERO_TITLE = "Vos notes de séance, lisibles par le propriétaire.";

export const HERO_LEAD =
  "Vous écrivez comme vous avez toujours écrit : abrégé, technique, rapide. Biume le met en forme pour le propriétaire. Vous relisez passage par passage, vous corrigez, et rien ne part avant que vous l'ayez décidé.";

export const HERO_CTA_PRIMARY = "Préparer mon premier compte rendu";
export const HERO_CTA_SECONDARY = "Voir le parcours";

export const HERO_CARD = {
  subject: "Nashira · séance du 12 mars",
  status: "Validé par vous",
  rawLabel: "Vos notes",
  raw: "palp : tension chaîne thoraco-lombaire G>D, restriction D14-L1 · suites : repos actif 48 h, revoir J+21",
  divider: "Biume met en forme",
  outLabel: "Compte rendu propriétaire",
  out: [
    "J'ai trouvé une zone de tension le long du dos, plus marquée à gauche, ainsi qu'une articulation du bas du dos qui bougeait moins bien que la normale.",
    "Pendant 48 heures, laissez-la bouger librement au pré, sans travail monté. Je la revois dans trois semaines.",
  ],
} as const;

/* ── Le constat ────────────────────────────────────────────────── */

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

/* ── Le relevé — démonstration ────────────────────────────────── */

export const SPECIMEN_EYEBROW = "Le relevé · démonstration";
export const SPECIMEN_TITLE = "Le même relevé, écrit deux fois.";
export const SPECIMEN_LEAD =
  "À gauche, vos notes. À droite, ce que le propriétaire reçoit. Faites défiler pour traverser les quatre temps du compte rendu.";
export const SPECIMEN_SUBJECT = "Nashira · jument selle français · 11 ans";
export const SPECIMEN_RAIL = ["Motif", "Examen", "Traitement", "Suites"] as const;
export const SPECIMEN_NOTE =
  "Séance fictive, écrite pour la démonstration. Aucun dossier réel n'est utilisé sur cette page.";

export const SPECIMEN_STEPS = [
  {
    id: "motif",
    heading: "Ce que vous notez en arrivant.",
    raw: "mot : raideur post-transport, refus incurvation D, prop. signale gêne dep. 3 sem",
    out: "Vous m'avez appelé parce que Nashira semblait gênée depuis environ trois semaines, en particulier depuis son dernier transport. À l'examen, elle avait effectivement du mal à s'incurver du côté droit.",
    body: "Biume repart de votre formulation, pas d'un formulaire. Les abréviations et l'ordre dans lequel vous écrivez restent les vôtres.",
  },
  {
    id: "examen",
    heading: "Le vocabulaire technique est traduit, pas effacé.",
    raw: "palp : tension chaîne thoraco-lombaire G>D, restriction D14-L1, sacro-iliaque D sensible",
    out: "J'ai trouvé une zone de tension le long du dos, plus marquée à gauche, ainsi qu'une articulation du bas du dos et le bassin droit qui bougeaient moins bien que la normale.",
    body: "La localisation reste exacte : rien n'est arrondi pour simplifier la phrase.",
  },
  {
    id: "traitement",
    heading: "Ce que vous avez fait, dit en clair.",
    raw: "ttt : tech. myotensives chaîne dorsale, mobilisation SI D, relâchement diaphragme",
    out: "J'ai travaillé en douceur sur les muscles du dos, remis en mouvement le bassin droit, puis relâché le diaphragme qui participait à la raideur.",
    body: "Le propriétaire comprend le geste et sa raison. C'est ce qui lui permet d'expliquer la séance à son entourage.",
  },
  {
    id: "suites",
    heading: "Les consignes deviennent des dates.",
    raw: "suites : repos actif 48 h, pas de cercle 5 j, revoir J+21",
    out: "Pendant 48 heures, laissez-la bouger librement au pré, sans travail monté. Évitez le travail en cercle pendant cinq jours. Je la revois dans trois semaines.",
    body: "Les suites sortent du paragraphe et deviennent des repères datés, que le propriétaire retrouve après votre départ.",
  },
] as const;

/* ── Plans photo réutilisables ────────────────────────────────── */

export const PRACTICE_PLATE = {
  eyebrow: "Ce que vos notes racontent",
  quote: "Vingt minutes de gestes tiennent en huit lignes d'abréviations.",
  attribution: "Le propriétaire, lui, n'était pas dans la pièce.",
  src: "/assets/images/landing/atelier-practice.webp",
  alt: "Une ostéopathe animalière, les deux mains posées sur le dos d'un chien.",
  objectPosition: "38% 42%",
  parallaxFactor: 0.2,
} as const;

export const OWNER_PLATE = {
  eyebrow: "Ce que le propriétaire retient",
  quote: "Ce que vous expliquez en partant, il l'aura oublié le soir.",
  attribution: "Le compte rendu prend le relais.",
  src: "/assets/images/landing/atelier-owner.webp",
  alt: "Une ostéopathe animalière assise au sol explique la séance à la propriétaire, le chien allongé entre elles.",
  objectPosition: "50% 34%",
  parallaxFactor: 0.18,
} as const;

/* ── Le contrôle ───────────────────────────────────────────────── */

export const CONTROL_EYEBROW = "Le contrôle";
export const CONTROL_TITLE = "Rien ne part avant que vous l'ayez validé.";
export const CONTROL_LEAD =
  "Chaque passage est relu séparément, et reste modifiable jusqu'à l'envoi. Le bouton d'envoi reste fermé tant qu'un passage attend votre regard.";
export const CONTROL_INVITE = "Essayez : validez les trois passages.";

export const CONTROL_PASSAGES = [
  {
    id: "p1",
    label: "Motif de la séance",
    text: "Vous m'avez appelé parce que Nashira semblait gênée depuis environ trois semaines, en particulier depuis son dernier transport.",
  },
  {
    id: "p2",
    label: "Examen",
    text: "J'ai trouvé une zone de tension le long du dos, plus marquée à gauche, ainsi qu'une articulation du bas du dos et le bassin droit qui bougeaient moins bien que la normale.",
  },
  {
    id: "p3",
    label: "Suites de séance",
    text: "Pendant 48 heures, laissez-la bouger librement au pré, sans travail monté. Évitez le travail en cercle pendant cinq jours.",
  },
] as const;

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
} as const;

export const OWNER_MOCK_FOLLOWUP = {
  label: "Suivi · J+2",
  question: "Comment va Nashira depuis la séance ?",
  answers: ["Mieux qu'avant", "Nettement mieux", "Sans changement"],
  selectedIndex: 1,
  note: "Seules les réponses qui demandent une action vous sont signalées.",
} as const;

/* ── Surfaces mobile + web ────────────────────────────────────── */

export const SURFACES_TITLE = "Le terrain dans la poche, l'atelier au bureau.";
export const SURFACES_LEAD =
  "Le même rapport, le même dossier. Deux endroits pour le travailler, selon le moment de votre journée.";

export const SURFACES_MOBILE = {
  chip: "Mobile",
  precision: "Sur place, entre deux rendez-vous",
  cards: [
    { label: "10:30 · Nashira", value: "Séance terminée", tone: "neutral" },
    {
      label: "Brouillon prêt",
      value: "4 sections préremplies, 1 à vérifier",
      tone: "violet",
    },
    { label: "Envoyé · 14:02", value: "", tone: "green" },
  ],
  points: [
    "Les rendez-vous du jour, la séance à clôturer",
    "Créer un propriétaire et un animal en deux champs",
    "Valider et partager les cas simples",
  ],
} as const;

export const SURFACES_WEB = {
  chip: "Web",
  precision: "Au calme, pour les cas complexes",
  windowTitle: "Compte rendu · Nashira",
  points: [
    "L'anatomie détaillée et les corrections fines",
    "La mise en page du document et sa prévisualisation",
    "L'historique complet du dossier, l'administration",
  ],
} as const;

/* ── Autour du compte rendu ───────────────────────────────────── */

export const AROUND_TITLE = "Autour du compte rendu, ce qui est déjà là.";
export const AROUND_LEAD = "Tout ce qui sert le compte rendu et le suivi. Rien de plus.";

export const AROUND_ITEMS = [
  {
    title: "Agenda et rendez-vous",
    body: "Les séances du jour, à déplacer ou à clôturer.",
  },
  {
    title: "Dossiers propriétaires et animaux",
    body: "Créés en deux champs, complétés au fil des séances.",
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

export const PRICING_TITLE = "Une formule, deux rythmes.";
export const PRICING_LEAD =
  "Facturé par praticien. Pas par compte rendu, pas par message envoyé.";

export const PRICING_PLAN = {
  monthly: { price: "29,99 €", note: "Sans engagement · résiliable à tout moment" },
  annual: { price: "24,99 €", note: "Facturé annuellement · 299,88 € par an" },
  included: [
    "Compte rendu propriétaire à partir de vos notes",
    "Relecture et validation passage par passage",
    "Export PDF, mis en page pour la lecture mobile",
    "Questionnaire de suivi et rappels de contrôle",
    "Dossiers illimités, export complet à tout moment",
  ],
  cta: "Commencer les 15 jours d'essai",
  ctaNote: "Sans carte bancaire. Rien à résilier si vous ne faites rien.",
} as const;

export const PRICING_DEMO_CARD = {
  title: "Vous préférez qu'on le fasse ensemble ?",
  body: "Trente minutes, votre dernière séance comme exemple, et vous repartez avec un compte rendu prêt à envoyer.",
  cta: "Réserver une démonstration",
} as const;

/* ── Questions ─────────────────────────────────────────────────── */

export const FAQ_TITLE = "Questions.";

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

/* ── Footer ────────────────────────────────────────────────────── */

export const FOOTER_COLUMNS = [
  {
    title: "La page",
    links: [
      { href: "#produit", label: "Le parcours" },
      { href: "#proprietaire", label: "Le propriétaire" },
      { href: "#tarifs", label: "Tarifs" },
      { href: "#questions", label: "Questions" },
    ],
  },
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

export const FOOTER_LINE =
  "Compte rendu et suivi post-séance pour ostéopathes et praticiens animaliers. Données hébergées en Europe.";
