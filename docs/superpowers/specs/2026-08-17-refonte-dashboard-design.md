# Refonte du dashboard — décisions de conception

**Date :** 2026-08-17
**Statut :** décisions arrêtées avec le propriétaire du produit, lot 1 livré.

## Problème

Le dashboard web n'a pas quatre défauts distincts, il en a un seul avec quatre
symptômes. Il n'existe aucune couche « page » partagée : chaque route improvise
ses propres `Panel`, `MetricCard` et `StatusPill` en couleurs codées en dur —
environ 320 occurrences de `slate-*` / `emerald-*` réparties sur quatre pages.
D'où l'incohérence visuelle, l'impossibilité de suivre un thème, et le fait que
la couche de composants partagée existante ne soit jamais utilisée.

En parallèle, une partie substantielle de la logique demandée est **déjà écrite
et testée, mais débranchée** — voir la section « État de l'existant ».

## Contrainte transverse

**Les utilisateurs finaux sont des ostéopathes animaliers non-techniciens.**

Cette contrainte prime sur toute considération esthétique :

- vocabulaire métier, jamais technique — « À remplir », pas « draft » ;
- une action évidente par écran, à un emplacement stable ;
- rien d'important derrière un survol ou un clic exploratoire : une action que
  l'on doit découvrir est une action qui n'existe pas ;
- aucun état à déduire — l'interface dit où on en est, elle ne le suggère pas ;
- le moins de décisions possible à prendre : préférer un défaut juste à une
  option supplémentaire.

## Système de design

**Source de vérité : `apps/mobile/src/design/tokens.ts`.** Le web s'aligne sur
le mobile, pas l'inverse. Le mobile et le web sont la même application pour le
même praticien, et le fichier mobile documente déjà ses calculs de contraste.

| Rôle | Clair | Sombre |
| --- | --- | --- |
| Action qui fait avancer | `#6a52d6` | `#a996f2` |
| État atteint (validé, envoyé, actif) | `#047857` | `#34d399` |
| Fond de page | `#f9fafb` | `#020617` |
| Surface | `#ffffff` | `#0f172a` |

Le violet porte l'action, le vert porte l'état. Un vert sur un bouton d'action
romprait cette lecture et doit être refusé en revue.

Contraintes d'implémentation :

- Les tokens produit vivent dans `packages/ui/src/styles/product.css`, importé
  par `apps/web` **uniquement**. `packages/ui/src/styles/globals.css` est aussi
  consommé par `apps/marketing`, dont la majorité des pages héritent de son
  `:root` : le modifier repeindrait le site vitrine.
- Typographie : Hanken Grotesk, la famille du site vitrine, auto-hébergée dans
  `apps/web/public/fonts`. Pas de dépendance npm — `@fontsource-variable`
  forçait bun à re-résoudre le graphe entier.
- Tout s'écrit sur tokens, palettes claire et sombre définies, mais **aucune
  bascule de thème n'est livrée**. Le mobile adoptera Hanken via `expo-font`
  ultérieurement.
- Une surface est tenue par sa bordure, pas par son ombre.

## Rendez-vous et compte rendu

### Création

À la création d'un rendez-vous, une case **cochée par défaut** propose
« Préparer le compte rendu de cette séance ». Le brouillon est créé avec le
rendez-vous, pré-rempli à partir de l'animal, du propriétaire, de la date et de
la note du rendez-vous.

Après validation, **on reste sur l'agenda**. Le praticien créait un rendez-vous ;
le renvoyer dans un éditeur de rapport casserait son intention.

### Visibilité d'un brouillon vide

Un brouillon encore vide **n'apparaît pas** dans la page Comptes rendus. Il vit
sur son rendez-vous dans l'agenda. Il entre dans la liste dès qu'il contient
quelque chose.

**Définition normative de « vide » :** `consultationReason` vide **et** `notes`
vide **et** zéro `anatomicalIssue` **et** zéro `advancedReportRecommendations`.
Le titre auto-généré ne compte pas. Les observations sont stockées dans
`anatomicalIssue` avec le type `observation`, donc comptées par la même règle.

### Cycle de vie

- `advancedReport.appointmentId` passe de `onDelete: "cascade"` à
  `onDelete: "set null"`. **En l'état, supprimer un rendez-vous détruit son
  compte rendu, y compris finalisé et déjà envoyé au propriétaire.**
- À la suppression d'un rendez-vous : brouillon vide supprimé, compte rendu
  non-vide conservé et détaché, toujours rattaché à l'animal.

### Statut de séance

Une séance est **terminée automatiquement quand `endAt` est passé**. Le
praticien n'a aucun geste à faire.

`CREATED` et `CONFIRMED` s'affichent tous deux « Prévu » — la distinction n'a
aucun sens pour un praticien qui saisit lui-même ses rendez-vous. Aucune
migration d'énumération : c'est une règle d'affichage.

Ce point est bloquant pour l'existant : rien dans l'interface ne fait
aujourd'hui passer un rendez-vous à `COMPLETED`, donc l'action « Créer le
compte rendu » de `day-agenda.ts` ne se déclenche jamais.

### Action proposée sur un rendez-vous

| Séance | Compte rendu | Action affichée |
| --- | --- | --- |
| Annulée | quel qu'il soit | « Annulé », aucune action |
| Prévue | absent | « Préparer le compte rendu » |
| Prévue | vide | aucune action, « Séance à venir » |
| Prévue | commencé | « Continuer le compte rendu » |
| Prévue | finalisé ou envoyé | « Voir le compte rendu » |
| Terminée | absent | « Créer le compte rendu » |
| Terminée | vide | « Remplir le compte rendu » |
| Terminée | commencé | « Continuer le compte rendu » |
| Terminée | finalisé | « Envoyer au propriétaire » |
| Terminée | envoyé | « Voir le compte rendu » |

## Structure des pages

Deux pages aux rôles disjoints, pour qu'aucune hésitation ne soit possible :

- **Vue d'ensemble** répond à « qu'est-ce que je dois faire ». Elle perd son
  calendrier et ses compteurs décoratifs.
- **Agenda** répond à « quand ». Calendrier, planification, détail d'une
  journée.

Les actions sont **visibles directement sur la carte du rendez-vous** : état en
clair, un bouton principal unique, et un menu `⋯` discret pour modifier,
annuler ou supprimer.

## Module de rapport

Dans le périmètre, mais ciblé. Couleurs et typographie comme partout, et
traduction des états machine en français métier :

| État persisté | Libellé praticien |
| --- | --- |
| `empty` | À remplir |
| `proposed` | À vérifier |
| `needs_confirmation` | À vérifier |
| `confirmed` | Validé |
| `not_applicable` | Sans objet |

Hors périmètre : l'outil anatomique, la génération PDF, le partage propriétaire.

## Découpage en lots

Une PR par lot, validation du propriétaire entre chaque.

1. **Livré.** Tokens produit, Hanken Grotesk, kit `components/dashboard/kit`.
   Branche `feat/dashboard-design-system`, commit `8dd9c3c`.
2. Agenda : rendez-vous actionnables, compte rendu depuis un rendez-vous,
   migration de la clé étrangère.
3. Vue d'ensemble recentrée sur « à traiter » et page Comptes rendus.
4. Animaux, Propriétaires, lisibilité des états dans l'éditeur, et Paramètres
   en alignement visuel seulement.

## État de l'existant

Écrit, testé, et jamais branché — à rebrancher plutôt qu'à réécrire :

- `apps/web/src/lib/dashboard/day-agenda.ts` : modèle complet de l'état d'un
  compte rendu par rendez-vous et de l'action suivante. Consommé uniquement par
  la vue d'ensemble.
- `components/dashboard/day-agenda/{day-agenda-view,day-agenda-card,day-agenda-todo}.tsx` :
  importés par aucune route.
- `components/dashboard/pages/reports-module/components/TabNavigation.tsx` :
  non importé par `reports-editor.tsx`.
- `functions/appointments.function.ts` : `updateAppointment`, `deleteAppointment`
  et `checkAppointmentConflicts` existent, aucun n'est appelé depuis l'agenda.
  On ne peut ni modifier, ni annuler, ni supprimer un rendez-vous.
- `DashboardPrioritiesPanel` : l'action `create_report` tombe dans le `else` de
  `PriorityAction` et s'affiche en texte gris non cliquable.

Piège associé : `getAppointments()` ne charge pas la relation `reports`, donc la
page Agenda est structurellement incapable de connaître l'état d'un compte rendu.
