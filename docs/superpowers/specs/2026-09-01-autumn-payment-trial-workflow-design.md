# Workflow de paiement Autumn.js — essai 15 jours

**Date :** 2026-09-01
**Statut :** décisions arrêtées avec le propriétaire du produit, à implémenter.

## Problème

L'application doit imposer un essai gratuit strictement limité à 15 jours,
au-delà duquel l'accès au dashboard doit être bloqué tant qu'aucun plan payant
n'est actif. Ce n'est **pas un chantier de zéro** : Autumn.js est déjà intégré
dans `apps/web`, mais de façon incomplète — voir « État de l'existant ».

## État de l'existant

Ce qui fonctionne déjà et reste inchangé :

- `apps/web/autumn.config.ts` — deux plans (`all_inclusive_monthly` à 29,99 €,
  `all_inclusive_yearly` à 299,88 €), chacun avec `freeTrial: { durationLength:
  15, durationType: "day", cardRequired: false }`.
- `apps/web/src/server/autumn.ts` — `autumnHandler` avec `identify()` qui
  résout le `customerId` sur `session.session.activeOrganizationId` (le client
  Autumn, c'est l'organisation, pas l'utilisateur).
- `apps/web/src/routes/api/autumn/$.ts` — route API qui expose ce handler.
- `apps/web/src/routes/__root.tsx` — `AutumnProvider` monté globalement.
- `apps/web/src/routes/dashboard/settings.tsx` — onglet Facturation
  (`BillingTab`) : affiche le plan actif, propose une mise à niveau (`attach`,
  câblé en dur sur l'annuel) et l'annulation en fin de période
  (`updateSubscription({ cancelAction: "cancel_end_of_cycle" })`).

Ce qui manque ou est cassé (objet de cette spec) :

1. **Aucun essai ne démarre jamais automatiquement.** `create-organization.tsx`
   n'appelle jamais `attach()` — une organisation fraîchement créée n'a aucun
   plan Autumn, donc aucun statut `trialing`.
2. **Aucun blocage n'existe.** Rien ne vérifie le statut d'abonnement avant de
   rendre `/dashboard/*` — un essai expiré ou une organisation sans plan a un
   accès complet et illimité.
3. **`trialWorkflow`** (`apps/web/src/trigger/trial.trigger.ts`) — 4 emails
   programmés (bienvenue, suivi J+5, rappel J+10, alerte J+14) — est écrit et
   testé mais n'est déclenché nulle part.
4. **Un seul plan est proposé côté UI** — `handleUpgrade` dans `settings.tsx`
   attache toujours `allInclusiveYearly`, sans choix mensuel.
5. **`autumn.config.ts` contient un bug de configuration** : les six features
   booléennes portent `item({ featureId, included: 0 })`. Le schéma `atmn`
   réserve `included` aux features à quantité (`metered`) ; pour une feature
   booléenne, seule la présence de l'item dans `items` doit accorder l'accès.
   `included: 0` risque de faire échouer `check()` même pour un abonné actif.

## Contrainte transverse

**Un seul tier de prix** (« all inclusive »), décliné en deux fréquences de
facturation. Les deux plans ont exactement les mêmes features. Il n'existe
donc pas de logique de « plan supérieur débloque plus » — la seule frontière
qui compte est **a un abonnement actif/à l'essai** vs **n'en a pas**. Cette
spec ne construit pas de gating fin par feature au-delà de ce qui existe déjà
en affichage dans les settings.

## Décisions arrêtées

1. **Démarrage automatique de l'essai.** Juste après la création réussie de
   l'organisation, un appel serveur attache le plan mensuel
   (`all_inclusive_monthly`) au customer Autumn `organizationId`, sans carte
   requise.
2. **Blocage dur au niveau du layout `/dashboard`.** Si l'organisation active
   n'a pas d'abonnement `active` ou `trialing`, toute route sous `/dashboard/*`
   redirige vers l'onglet Facturation, à l'exception de cet onglet lui-même
   (qui doit rester accessible pour permettre de payer).
3. **Choix du plan dans l'onglet Facturation.** Le bouton unique « Mettre à
   niveau » (câblé en dur sur l'annuel) est remplacé par un sélecteur
   mensuel/annuel. Ce même composant sert d'écran d'atterrissage pour les
   utilisateurs redirigés par le blocage (bannière contextuelle).
4. **Emails de trial branchés.** `trialWorkflow.trigger(...)` est appelé juste
   après l'`attach()` de démarrage d'essai, avec `trialStart`/`trialEnd`
   calculés à partir de la date de création de l'organisation + 15 jours.
5. **Correction du bug `included: 0`** sur les features booléennes, sans
   toucher à la structure des plans par ailleurs.
6. **Backfill des organisations existantes.** Script ponctuel qui attache le
   plan mensuel (avec un nouvel essai de 15 jours) à toute organisation sans
   abonnement Autumn, à exécuter avant l'activation du blocage en production.
7. **Hors périmètre.** L'app mobile Flutter ne reçoit aucun écran de
   facturation. Le gating fin par feature (au-delà de l'accès global) n'est
   pas construit — un seul tier existe.

## Architecture et flux de données

### 1. Démarrage de l'essai — `apps/web/src/lib/api/actions/trial.action.ts` (nouveau)

Server function (`createServerFn`, pattern identique à
`report-reminder.action.ts`) :

```
startOrganizationTrialFn({ organizationId })
  → new Autumn({ secretKey: env.AUTUMN_SECRET_KEY }) (SDK "autumn-js", export racine)
  → client.billing.attach({
      customerId: organizationId,
      planId: autumnPlanIds.allInclusiveMonthly,
      customerData: { email: ownerEmail, name: organizationName, metadata: { organizationId, ownerUserId } },
    })
  → calcule trialStart = now, trialEnd = now + 15 jours
  → trialWorkflow.trigger({ organizationId, organizationName, organizationEmail: ownerEmail, trialStart, trialEnd })
```

`customerData` reprend exactement la forme produite par `identify()` dans
`server/autumn.ts`, pour que le customer résolu au premier appel API (settings,
paywall) soit identique à celui créé ici — Autumn dédoublonne par
`customerId`, donc pas de risque de client fantôme, mais la cohérence des
métadonnées évite une divergence silencieuse.

`create-organization.tsx` appelle cette server function juste après
`organizationClient.create()` a réussi, avant le `window.location.replace("/dashboard")`.
Si l'attach échoue, on ne bloque pas la création de l'organisation (elle
existe déjà côté better-auth) : on log l'erreur côté serveur et on laisse le
`beforeLoad` du dashboard rediriger vers la facturation au prochain accès —
l'utilisateur pourra relancer un essai depuis là. Pas de retry automatique :
complexité disproportionnée pour un cas limite déjà couvert par le filet du
paywall.

### 2. Blocage dans `dashboard.tsx`

Extension du `beforeLoad` existant (après résolution de `currentOrganization`,
avant le rendu) :

```
subscription = await getOrganizationSubscriptionStatus() // nouvelle server fn
  → new Autumn({ secretKey }).customers.get({ customerId: currentOrganization.id })
  → cherche une subscription avec status in ["active", "trialing"]

si aucune trouvée ET route actuelle ≠ /dashboard/settings :
  throw redirect({ to: "/dashboard/settings", search: { tab: "billing", blocked: true } })
```

`/dashboard/settings` reste exemptée de la redirection (elle contient l'onglet
Facturation, seule porte de sortie du blocage). Le paramètre `blocked: true`
déclenche la bannière contextuelle dans `BillingTab` (« Votre essai est
terminé, choisissez un plan pour continuer »).

`dashboard_.reports_.$id_.edit.tsx` sort du layout `dashboard.tsx` (convention
TanStack Router de l'underscore) et doit appeler la même vérification dans son
propre `beforeLoad`.

La vérification interroge l'API Autumn à chaque navigation vers `/dashboard`
(pas de cache local) — c'est le point le plus sensible en latence ajoutée ;
voir « Risques » plus bas.

### 3. Sélecteur de plan — `BillingTab` dans `settings.tsx`

`handleUpgrade(planId)` prend désormais le `planId` en paramètre au lieu de
la valeur figée `allInclusiveYearly`. Deux boutons/cartes (Mensuel 29,99 €/mois,
Annuel 299,88 €/an — libellé "2 mois offerts" ou équivalent) appellent chacun
`attach({ planId, successUrl })`. Le composant lit le search param `blocked`
de la route pour afficher la bannière d'essai expiré au lieu du panneau
"Abonnement actuel" habituel quand `!activeSubscription`.

### 4. Correction `autumn.config.ts`

Retrait de `included: 0` sur les six `item()` des deux plans — l'entrée
`items: [{ featureId: X.id }]` (sans `included`) suffit à accorder une feature
booléenne selon le schéma `atmn`. Aucun autre changement de structure de plan.

### 5. Backfill — script ponctuel (`scripts/backfill-autumn-trials.ts` ou tâche
trigger.dev à exécution unique, à trancher en phase d'implémentation)

Parcourt toutes les organisations en base, pour chacune sans abonnement Autumn
actif/`trialing` : appelle la même logique que `startOrganizationTrialFn`
(extraction en fonction partagée pour éviter la duplication). Idempotent —
relançable sans risque puisque `billing.attach` sur un customer qui a déjà ce
plan ne redémarre pas un essai déjà entamé (à vérifier en implémentation
contre le comportement réel de l'API Autumn sur un customer déjà abonné).

## Gestion des erreurs

- **`attach()` échoue à la création d'org** : non bloquant pour la création,
  logué, rattrapé par le paywall au prochain accès dashboard (voir §1).
- **`customers.get()` échoue dans le `beforeLoad`** (Autumn indisponible) :
  fail-open — laisser passer plutôt que bloquer tout le dashboard sur une
  panne tierce. Loggé côté serveur pour supervision.
- **`trialWorkflow.trigger()` échoue** : n'empêche pas l'attach ni l'accès ;
  best-effort, pas de retry applicatif au-delà de ce que trigger.dev fait
  déjà nativement.

## Tests

- Server function `startOrganizationTrialFn` : attach appelé avec le bon
  `planId`/`customerId`/`customerData`, trigger appelé avec des dates
  cohérentes (`trialEnd` = `trialStart` + 15 jours).
- `getDashboardRedirectTarget`-like helper pour la logique d'abonnement :
  fonction pure testable isolément (statuts `active`/`trialing`/`canceled`/
  absent → redirige ou non), sur le modèle de `getDashboardRedirectTarget`
  déjà testé dans ce fichier.
- `BillingTab` : sélection mensuel vs annuel appelle `attach` avec le bon
  `planId` ; bannière `blocked` s'affiche/se cache selon le search param.
- Script de backfill : dry-run sur un jeu d'organisations mixte (avec/sans
  abonnement) ne touche que celles sans abonnement.

## Risques et points ouverts

- **Latence du `beforeLoad`** : un appel réseau Autumn à chaque navigation
  dashboard. À mesurer en implémentation ; si notable, un cache court côté
  session (quelques minutes) pourra être ajouté — non inclus dans cette
  spec pour rester au plus simple d'abord.
- **Comportement Autumn en fin d'essai sans carte** (`cardRequired: false`) —
  **recherché a posteriori dans la documentation publique Autumn, faute
  d'accès à un compte réel pendant l'implémentation.** La documentation
  confirme explicitement le point qui motivait ce risque : « quand l'essai
  expire, le client perd l'accès sauf s'il ajoute un moyen de paiement »
  (trials doc). `hasActiveOrTrialingSubscription` utilise une *allowlist*
  (`status` doit valoir `active` ou `trialing`) plutôt qu'une liste
  d'exclusion — donc tout statut non reconnu (y compris un statut jamais vu
  en développement) refuse l'accès par défaut, ce qui est le sens sûr pour
  un paywall. Une incohérence existe entre deux pages de la doc Autumn : la
  référence API ne documente que `active`/`scheduled` comme valeurs de
  `status` (type `OpenEnum` côté SDK, donc d'autres chaînes peuvent
  légitimement apparaître), tandis que la page conceptuelle des abonnements
  liste explicitement `active`, `trialing`, `past_due`, `scheduled`,
  `expired` — ce qui corrobore l'hypothèse déjà présente dans le code
  préexistant (`settings.tsx`) que `trialing` est une valeur réelle. Le
  correctif appliqué en revue finale exclut aussi les abonnements
  `pastDue: true` (paiement en échec), qui restent `status: "active"` mais
  ne doivent pas donner accès. Pour l'annulation en fin de période
  (`cancel_end_of_cycle`), la doc confirme « l'abonnement reste actif
  jusqu'à la fin de la période de facturation en cours » — la logique
  actuelle ne coupe donc pas l'accès d'un client qui a déjà payé.
  **Ce qui reste non vérifié empiriquement** (nécessite un vrai compte
  Autumn, avec attente réelle ou un abonnement déjà expiré à inspecter) :
  la valeur exacte de `status` observée en pratique une fois un essai sans
  carte réellement expiré, et si la subscription disparaît du tableau
  `customer.subscriptions` ou y reste avec un statut refusant l'accès —
  dans les deux cas la logique actuelle (allowlist stricte) se comporte
  correctement, mais une vérification live reste recommandée avant
  d'activer le blocage dur en production.
- **Idempotence du backfill** face à `billing.attach` sur un customer déjà
  abonné — à vérifier contre le comportement réel de l'API avant d'exécuter
  en production.
