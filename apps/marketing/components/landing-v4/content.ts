/**
 * Source unique du texte de la v4.
 *
 * Règle tenue partout dans ce fichier : aucune preuve inventée. Pas de
 * témoignage, pas de compteur d'utilisateurs, pas de logo partenaire.
 * Ce que la page affirme, elle le démontre — la seule démonstration
 * autorisée est le produit lui-même, et elle est étiquetée comme telle.
 */

/** Prise de rendez-vous pour la démonstration accompagnée. */
export const DEMO_URL = "https://cal.com/mathieu-chambaud-biume";

export const TRIAL_NOTE = "15 jours d'essai, sans carte bancaire";

/** Ancres de section, dans l'ordre de lecture. Sert à la fois la
 *  navigation et la numérotation en gouttière. */
export const SECTIONS = [
  { id: "releve", nav: "Le relevé" },
  { id: "constat", nav: "Le constat" },
  { id: "controle", nav: "Le contrôle" },
  { id: "suivi", nav: "Le suivi" },
  { id: "limites", nav: "Les limites" },
  { id: "tarifs", nav: "Tarifs" },
] as const;

/* ── Hero ──────────────────────────────────────────────────────── */

export const HERO_TITLE_LINES = [
  "Vos notes de séance",
  "deviennent un compte rendu",
  "que le propriétaire comprend.",
] as const;

export const HERO_LEAD =
  "Vous écrivez comme vous avez toujours écrit : abrégé, technique, rapide. Biume le met en forme pour le propriétaire. Vous relisez passage par passage, vous corrigez, et rien ne part avant que vous l'ayez décidé.";

/** La fiche technique du hero. Format cote / valeur : c'est le geste
 *  qui donne à la page son registre de planche d'atelier. */
export const HERO_SPEC = [
  { key: "Pour", value: "Ostéopathes animaliers indépendants" },
  { key: "Entrée", value: "Vos notes de séance, dans vos mots" },
  { key: "Sortie", value: "Un compte rendu relu et validé par vous" },
  { key: "Envoi", value: "Manuel. Jamais automatique" },
  { key: "Essai", value: "15 jours, sans carte bancaire" },
] as const;

/* ── Le relevé — la démonstration ──────────────────────────────── */

export const SPECIMEN_NOTE =
  "Séance fictive, écrite pour la démonstration. Aucun dossier réel n'est utilisé sur cette page.";

export const SPECIMEN_SUBJECT = "Nashira · jument selle français · 11 ans";

export const SPECIMEN_STEPS = [
  {
    id: "motif",
    label: "Motif",
    heading: "Ce que vous notez en arrivant.",
    body: "Biume repart de votre formulation, pas d'un formulaire. Les abréviations, les raccourcis et l'ordre dans lequel vous écrivez restent les vôtres.",
    raw: "mot : raideur post-transport, refus incurvation D, prop. signale gêne dep. 3 sem",
    out: "Vous m'avez appelé parce que Nashira semblait gênée depuis environ trois semaines, en particulier depuis son dernier transport. À l'examen, elle avait effectivement du mal à s'incurver du côté droit.",
  },
  {
    id: "examen",
    label: "Examen",
    heading: "Le vocabulaire technique est traduit, pas effacé.",
    body: "Chaque terme de métier trouve son équivalent compréhensible. La localisation reste exacte : rien n'est arrondi pour simplifier la phrase.",
    raw: "palp : tension chaîne thoraco-lombaire G>D, restriction D14-L1, sacro-iliaque D sensible",
    out: "J'ai trouvé une zone de tension le long du dos, plus marquée à gauche, ainsi qu'une articulation du bas du dos et le bassin droit qui bougeaient moins bien que la normale.",
  },
  {
    id: "traitement",
    label: "Traitement",
    heading: "Ce que vous avez fait, dit en clair.",
    body: "Le propriétaire comprend le geste et sa raison. C'est ce qui lui permet d'expliquer la séance à son entourage — et de vous rappeler.",
    raw: "ttt : tech. myotensives chaîne dorsale, mobilisation SI D, relâchement diaphragme",
    out: "J'ai travaillé en douceur sur les muscles du dos, remis en mouvement le bassin droit, puis relâché le diaphragme qui participait à la raideur.",
  },
  {
    id: "suites",
    label: "Suites",
    heading: "Les consignes deviennent des dates.",
    body: "Les suites de séance sortent du paragraphe et deviennent des repères datés, que le propriétaire retrouve après votre départ.",
    raw: "suites : repos actif 48 h, pas de cercle 5 j, revoir J+21",
    out: "Pendant 48 heures, laissez-la bouger librement au pré, sans travail monté. Évitez le travail en cercle pendant cinq jours. Je la revois dans trois semaines.",
  },
] as const;

/* ── Le constat ────────────────────────────────────────────────── */

export const FACTS = [
  {
    n: "01",
    title: "La séance finit dans la voiture.",
    body: "Le compte rendu se rédige entre deux rendez-vous, sur un téléphone, souvent le soir. Ce n'est pas un problème d'organisation : c'est la forme du métier.",
  },
  {
    n: "02",
    title: "Vos notes ne sont pas faites pour être lues.",
    body: "Elles sont faites pour être écrites vite et vous servir à vous. Les envoyer telles quelles laisse le propriétaire avec un texte qu'il ne peut pas interpréter.",
  },
  {
    n: "03",
    title: "Et les reformuler prend le temps d'une séance.",
    body: "Traduire vingt lignes techniques en un document lisible demande vingt à trente minutes. Multipliées par le nombre de séances de la semaine.",
  },
] as const;

/* ── Le contrôle ───────────────────────────────────────────────── */

export const CONTROL_PASSAGES = [
  {
    id: "p1",
    label: "Motif de la séance",
    text: "Vous m'avez appelé parce que Nashira semblait gênée depuis environ trois semaines, en particulier depuis son dernier transport.",
    state: "valide",
  },
  {
    id: "p2",
    label: "Examen",
    text: "J'ai trouvé une zone de tension le long du dos, plus marquée à gauche, ainsi qu'une articulation du bas du dos et le bassin droit qui bougeaient moins bien que la normale.",
    state: "revu",
  },
  {
    id: "p3",
    label: "Suites de séance",
    text: "Pendant 48 heures, laissez-la bouger librement au pré, sans travail monté. Évitez le travail en cercle pendant cinq jours.",
    state: "attente",
  },
] as const;

/* ── Le suivi ──────────────────────────────────────────────────── */

export const FOLLOW_UP = [
  {
    when: "J+0",
    title: "Le compte rendu part",
    body: "Une fois que vous l'avez validé, et pas avant. Le propriétaire le reçoit en PDF, mis en page pour être lu sur un téléphone.",
  },
  {
    when: "J+2",
    title: "Vous demandez des nouvelles",
    body: "Une relance courte, préparée à partir des suites que vous avez écrites. Vous l'envoyez, ou vous ne l'envoyez pas.",
  },
  {
    when: "J+21",
    title: "Le contrôle revient dans votre semaine",
    body: "La date que vous avez notée en fin de séance ressort d'elle-même, avec le compte rendu attaché.",
  },
] as const;

/* ── Les limites ───────────────────────────────────────────────── */

export const BOUNDARIES = [
  "Biume ne pose aucun diagnostic et ne propose aucun protocole de traitement.",
  "Biume n'écrit aucune observation qui ne soit pas déjà dans vos notes.",
  "Aucun document ne part sans que vous ayez cliqué sur envoyer.",
  "Biume ne remplace ni votre logiciel de gestion, ni votre agenda, ni votre facturation.",
  "Vos dossiers vous appartiennent : export complet, à tout moment, sans conditions.",
] as const;

/* ── Tarifs ────────────────────────────────────────────────────── */

export const PLAN_INCLUDED = [
  "Compte rendu propriétaire à partir de vos notes",
  "Relecture et validation passage par passage",
  "Export PDF, mis en page pour la lecture mobile",
  "Relances et rappels de contrôle après séance",
  "Dossiers illimités, export complet à tout moment",
] as const;

/* ── Questions ─────────────────────────────────────────────────── */

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
