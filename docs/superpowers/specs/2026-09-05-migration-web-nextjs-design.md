# Migration de `apps/web` de TanStack Start vers Next.js

**Date :** 5 septembre 2026

**Statut :** design validé (session de cadrage du 3 au 5 septembre 2026)

**Périmètre :** `apps/web` uniquement. `apps/marketing` et `apps/mobile` ne sont pas touchés.

**Plans dérivés :** à écrire après validation de ce document.

## 1. Résumé

`apps/web` (64 000 lignes, 387 fichiers) tourne sur TanStack Start + Vite + Nitro. `apps/marketing` tourne déjà sur Next 16.2.9. Ce document fixe la migration de l'application produit vers Next.js, en architecture **hybride RSC + TanStack Query**, sur une branche unique découpée en huit tranches vérifiables.

La migration est rendue tenable par trois faits constatés dans le code :

1. **`lib/api/actions/*.action.ts` est déjà une couche anti-corruption.** Sa signature publique ne dépend d'aucun framework. On garde la signature, on change l'implémentation — les 6 fichiers `lib/api/queries/*` et les 173 composants ne bougent pas.
2. **83 des 85 fichiers de test ignorent le framework.** Ils testent les services, la persistance, l'isolation multi-tenant et le contrat OpenAPI. Ils servent de filet à chaque tranche.
3. **`server/` (61 fichiers) et `trigger/` sont déjà agnostiques.** L'API mobile, l'extraction, la transcription, le billing et l'accès propriétaire ne sont pas réécrits.

Environ **85 % du code ne change pas**.

## 2. État constaté le 5 septembre 2026

### 2.1 Volumétrie

| | |
| --- | --- |
| Fichiers TypeScript (hors `routeTree.gen.ts`) | 387 |
| Lignes | ~64 000 |
| Fichiers de routes | 25 : 1 racine, 17 pages, 7 routes API (plus 2 tests colocalisés) |
| Composants | 173 |
| Fichiers de test | 85, dont **2 seulement** importent TanStack (623 tests verts, 12 skippés) |
| Fichiers important `@tanstack/react-router` | 40 |
| `createServerFn` | 77 occurrences, 12 fichiers `*.function.ts` |
| Couche `lib/api/actions/` | 14 fichiers, 677 lignes |
| Couche `lib/api/queries/` | 6 fichiers |

### 2.2 Répartition des fonctions serveur

32 `createServerFn({ method: "GET" })`, 25 en `POST`. Une part importante des `GET` ne sert qu'au rendu de page : en RSC elles redeviennent de simples appels de fonction, sans endpoint HTTP. **Seules les fonctions consommées par les 6 fichiers `queries/*` ont besoin d'un endpoint côté client.**

### 2.3 Couplage au framework, par nature

| Point de couplage | Ampleur | Nature du portage |
| --- | --- | --- |
| `createFileRoute` | 27 fichiers | réécriture en arborescence `app/` |
| `<Link>`, `useNavigate` | 22 + 26 occurrences | remplacement mécanique par `next/link`, `useRouter` |
| `useSearch` + `validateSearch` | 5 routes | `searchParams` (RSC) et `useSearchParams` (client) — **le point le plus délicat** |
| `useParams` | 6 occurrences | `params` de page |
| `getRequestHeaders` / `getRequest` | **4 fichiers** | `headers()` de `next/headers` |
| `import.meta.env` | **1 fichier** (`components/auth/auth-layout.tsx:15`) | `process.env.NEXT_PUBLIC_*` |
| `trigger.config.ts` | 1 ligne (`dirs`) | `["src/trigger"]` → `["trigger"]` |

### 2.4 Dépendances mortes

Les sept paquets `@tanstack/ai`, `@tanstack/ai-anthropic`, `@tanstack/ai-client`, `@tanstack/ai-gemini`, `@tanstack/ai-ollama`, `@tanstack/ai-openai`, `@tanstack/ai-react` sont **déclarés dans `package.json` et jamais importés**. Ils sont supprimés sans migration.

Le stack IA réellement utilisé est le **Vercel AI SDK** (`ai` v7, `@ai-sdk/react`, `@ai-sdk/openai`), consommé par `server/ai/*`, `components/ai-elements/*`, `hooks/useVulgarisationAgent.ts` et l'assistant. C'est le cas le mieux supporté par Next.

### 2.5 Le cas `@react-pdf/renderer`

`components/dashboard/pages/reports-module/reports-details.tsx:320` monte `PDFDownloadLink` en ligne dans l'arbre de rendu :

```tsx
<PDFDownloadLink
  document={<ReportPDF report={{ id: report.id, /* littéral d'objet */ }} … />}
```

L'élément JSX et l'objet `report` sont reconstruits à chaque rendu. `PDFDownloadLink` compare l'identité de sa prop `document`, voit une nouvelle référence, et relance son réconciliateur et son moteur de mise en page (fontkit, textkit) **sur le thread principal**. Chaque interaction dans cette page de 888 lignes recalcule donc un PDF complet.

`@react-pdf` et `fontkit` pèsent **11,4 Mo** dans `node_modules`, embarqués dans le bundle client de cette page et de `reports-table.tsx`.

**Ce ralentissement n'est pas causé par TanStack Start** et ne serait pas corrigé par le seul changement de framework. Le chemin serveur existe déjà : `lib/api/actions/email.action.ts:2` importe `renderToBuffer` et génère le même PDF côté serveur pour l'envoi par email. La correction est traitée en tranche 6 (§ 9).

## 3. Objectifs

- Une seule famille de framework dans le monorepo : `apps/web` et `apps/marketing` en Next 16, même version, mêmes conventions, même forme de dossiers.
- Le premier rendu d'une page dashboard n'exige plus d'aller-retour RPC depuis le navigateur : la donnée arrive inlinée dans le flux serveur.
- `@react-pdf/renderer` disparaît du bundle client ; le PDF est produit par le serveur.
- Le déploiement Vercel devient natif : plus de préréglage Nitro, plus de dépendance `nitro-nightly`.
- Les versions sont figées : plus aucune dépendance en `latest`.
- Chaque tranche se termine sur une preview Vercel utilisable et une suite de tests verte.

## 4. Non-objectifs

- **Ne pas fusionner `apps/web` et `apps/marketing`.** Surfaces de risque différentes (l'une publique et indexée, l'autre authentifiée avec accès base), cadences de déploiement différentes, domaines différents. Le partage passe déjà correctement par `packages/ui`.
- **Ne pas supprimer TanStack Query.** Le cache client porte la recherche instantanée, la pagination, les mises à jour optimistes de l'agenda et l'invalidation après mutation. On le garde.
- **Ne pas réécrire les 173 composants.** Toute proposition qui les fait entrer dans le périmètre est hors budget.
- **Ne pas toucher au contrat `/api/mobile/v1`.** Voir § 11.
- **Ne pas refondre l'UI.** Aucun changement visuel n'est attendu de cette migration.

## 5. Décisions d'architecture

### 5.1 Couche données : hybride RSC + TanStack Query

Trois options ont été examinées : portage conservateur (tout client, Query inchangé), hybride, full RSC (suppression de Query, `useActionState` partout). **L'hybride est retenu.**

Le portage conservateur ne rapporte rien sur la latence de données, qui est l'un des motifs de la migration. Le full RSC impose de réécrire les composants qui dépendent d'un cache client, ce qui est un non-objectif.

### 5.2 Le point d'appui

`lib/api/actions/clients.action.ts` dans son état actuel :

```ts
export function getAllClients(params: GetAllClientsParams = {}) {
  return getAllClientsFn({ data: params });   // déballe la convention { data } de TanStack Start
}
```

La signature `getAllClients(params) => Promise<Client[]>` est indépendante du framework. **Elle est conservée à l'identique.** Seule l'implémentation change. Par conséquent `lib/api/queries/*.query.ts` n'est pas modifié, et tout composant faisant `useSuspenseQuery(clientsQueryOptions(...))` continue de fonctionner sans édition.

### 5.3 Les trois chemins de données

```
1. Lecture serveur     page.tsx (RSC) ── await getAllClients(params) ──→ Drizzle
   (premier rendu)     puis <ClientsTable initialData={rows}/>           aucun RPC

2. Lecture client      useQuery ──→ clients.action.ts ──→ GET /api/… ──→ Drizzle
   (recherche,                      (signature inchangée)  route handler
    pagination,
    invalidation)

3. Mutation            useMutation ──→ clients.action.ts ──→ "use server" action
                                                             + revalidatePath
```

**Les lectures client passent par des route handlers, pas par des Server Actions.** Next sérialise les Server Actions côté client, une seule à la fois. Le dashboard émet plusieurs lectures en parallèle ; les passer en Server Actions les mettrait en file d'attente et rendrait les pages **plus lentes qu'aujourd'hui**. Les route handlers restent parallèles et cacheables.

Le nombre de handlers nécessaires est faible : seules les fonctions consommées par les 6 fichiers `queries/*` en ont besoin, soit environ **6 handlers de lecture**, pas 32.

### 5.4 Contexte de requête

`server/auth/organization-scope.ts` mémoïse aujourd'hui la résolution d'organisation dans une `WeakMap<Request, Promise<string>>`, pour éviter de relire la session à chaque fonction serveur d'une même requête (jusqu'à douze sur la page Animaux).

En Next, cette mémoïsation devient `cache()` de React : même sémantique — une résolution par requête — moins de code, et le partage fonctionne en plus **entre les Server Components et les Server Actions d'une même requête**, ce que la `WeakMap` ne couvrait pas. C'est un gain, pas un compromis.

Les quatre fichiers utilisant `getRequestHeaders()` passent à `headers()` de `next/headers`.

## 6. Structure cible

**Pas de dossier `src/`.** L'application prend la forme de `apps/marketing`, qui a déjà `app/`, `components/`, `lib/` à la racine.

Le déplacement `src/*` → `./*` est un déplacement en bloc : les 17 fichiers à imports relatifs conservent leurs chemins (les `../` restent à la même distance), et les 108 fichiers en `#/` sont absorbés par un changement d'alias à deux endroits.

```jsonc
// apps/web/package.json     "#/*": "./src/*"    →  "#/*": "./*"
// apps/web/tsconfig.json    "#/*": ["./src/*"]  →  "#/*": ["./*"]
//                           "@/*": ["./src/*"]  →  "@/*": ["./*"]
```

**Aucun fichier applicatif n'est modifié par la suppression de `src/`.**

```
apps/web/
  app/
    layout.tsx                   shell HTML + providers            (ex-__root.tsx)
    page.tsx                     "/" → redirection selon session
    (auth)/
      signin/page.tsx            les 4 pages ex-ssr:false
      signup/page.tsx            → "use client"
      forgot-password/page.tsx
      reset-password/page.tsx
    select-organization/page.tsx
    create-organization/page.tsx
    dashboard/
      layout.tsx                 RSC : garde auth + garde billing + shell
      page.tsx
      loading.tsx  error.tsx     ex-pendingComponent / errorComponent
      agenda/page.tsx
      clients/page.tsx
      patients/page.tsx
      reports/page.tsx
      reports/[id]/page.tsx
      settings/page.tsx
      assistant/page.tsx
    (fullscreen)/
      dashboard/reports/[id]/edit/page.tsx     hors du shell dashboard
    api/
      auth/[...all]/route.ts
      autumn/[...all]/route.ts
      mobile/v1/[[...path]]/route.ts           contrat gelé
      owner/[...all]/route.ts
      chat/route.ts
      uploadthing/route.ts
      vulgarisation/route.ts
      reports/[id]/pdf/route.ts                nouveau — § 9
      …6 handlers de lecture                   § 5.3
  components/   173 fichiers, inchangés hors Link/useNavigate
  functions/    createServerFn retiré ; mutations en Server Actions
  lib/          queries inchangées ; actions ré-implémentées à signature identique
  server/       61 fichiers, inchangés
  hooks/  integrations/  trigger/  public/  styles.css
  next.config.ts  postcss.config.mjs  eslint.config.mjs
```

## 7. Correspondance des routes

**Aucune URL ne change.** Voir § 11.

| Aujourd'hui | Demain | URL |
| --- | --- | --- |
| `routes/__root.tsx` | `app/layout.tsx` | — |
| `routes/index.tsx` | `app/page.tsx` | `/` |
| `routes/signin.tsx` | `app/(auth)/signin/page.tsx` | `/signin` |
| `routes/signup.tsx` | `app/(auth)/signup/page.tsx` | `/signup` |
| `routes/forgot-password.tsx` | `app/(auth)/forgot-password/page.tsx` | `/forgot-password` |
| `routes/reset-password.tsx` | `app/(auth)/reset-password/page.tsx` | `/reset-password` |
| `routes/select-organization.tsx` | `app/select-organization/page.tsx` | `/select-organization` |
| `routes/create-organization.tsx` | `app/create-organization/page.tsx` | `/create-organization` |
| `routes/dashboard.tsx` | `app/dashboard/layout.tsx` | — |
| `routes/dashboard/index.tsx` | `app/dashboard/page.tsx` | `/dashboard` |
| `routes/dashboard/agenda.tsx` | `app/dashboard/agenda/page.tsx` | `/dashboard/agenda` |
| `routes/dashboard/clients.tsx` | `app/dashboard/clients/page.tsx` | `/dashboard/clients` |
| `routes/dashboard/patients.tsx` | `app/dashboard/patients/page.tsx` | `/dashboard/patients` |
| `routes/dashboard/reports.tsx` | `app/dashboard/reports/page.tsx` | `/dashboard/reports` |
| `routes/dashboard/reports_.$id.tsx` | `app/dashboard/reports/[id]/page.tsx` | `/dashboard/reports/:id` |
| `routes/dashboard/settings.tsx` | `app/dashboard/settings/page.tsx` | `/dashboard/settings` |
| `routes/dashboard/assistant.tsx` | `app/dashboard/assistant/page.tsx` | `/dashboard/assistant` |
| `routes/dashboard_.reports_.$id_.edit.tsx` | `app/(fullscreen)/dashboard/reports/[id]/edit/page.tsx` | `/dashboard/reports/:id/edit` |

Deux remarques sur les suffixes `_` de TanStack, qui servent à échapper à l'imbrication d'un fichier de route parent :

- **`reports_.$id`** ne demande aucun traitement particulier. TanStack imbrique les fichiers de route entre eux ; Next n'imbrique que les `layout.tsx`. Comme `reports/page.tsx` est une page et non un layout, `reports/[id]/page.tsx` ne s'y imbrique pas naturellement.
- **`dashboard_.reports_.$id_.edit`** échappe au shell dashboard tout entier, d'où le route group `(fullscreen)/`. Cette route porte **déjà son propre `beforeLoad`** aujourd'hui : elle garde donc sa propre garde demain, par un appel explicite à la fonction de garde partagée. Le `cache()` de § 5.4 rend cet appel gratuit.

Deux groupes contenant chacun un segment `dashboard/` est licite tant qu'aucune page ne résout vers la même URL, ce qui est le cas ici.

## 8. Les routes API

Les 7 routes délèguent toutes à un handler qui reçoit une `Request` standard et renvoie une `Response`. Le portage est direct :

```ts
// avant                                  // après
createFileRoute("/api/auth/$")({          export const GET  = (req: Request) => auth.handler(req)
  server: { handlers: { GET, POST } },    export const POST = (req: Request) => auth.handler(req)
})
```

Hono, better-auth, uploadthing et le streaming du Vercel AI SDK parlent tous le standard Web. **La logique de `/api/mobile/v1` n'est pas modifiée** : seul le point de montage change.

## 9. Le PDF des comptes rendus

Traité en tranche 6, comme livrable et non comme chantier annexe.

- Nouveau `app/api/reports/[id]/pdf/route.ts` : garde d'organisation, chargement du compte rendu, `renderToBuffer(<ReportPDF …/>)` — le code déjà couvert par `ReportPDF.helpers.test.ts` — et renvoi du flux avec `Content-Type: application/pdf`.
- `PDFDownloadLink` est retiré de `reports-details.tsx` **et** de `reports-table.tsx` ; les boutons redeviennent des liens.
- `@react-pdf/renderer` n'est plus importé que par du code serveur (`email.action.ts` et le nouveau handler) : **il disparaît du bundle client**.

Vérification : le PDF produit est comparé à la sortie actuelle, et la taille du bundle de la page détail est mesurée avant et après.

## 10. Découpage en tranches

Huit tranches, chacune vérifiable et déployable en preview Vercel.

| # | Tranche | Contenu | Vérification |
| --- | --- | --- | --- |
| 0 | **Socle** | branche `migrate/next`, suppression de `src/`, alias, Next 16.2.9, `next.config.ts`, Tailwind v4 via postcss, vitest adapté. `routes/` exclu du tsconfig, encore sur disque | `dev` démarre, `check-types` vert, les 623 tests verts |
| 1 | **Routes API** | les 7 handlers. Le plus risqué à régresser, le moins cher à porter, et il débloque tout le reste | `openapi-drift.test.ts` et les 10 fichiers `mobile-api.*.test.ts` verts ; app Expo pointée sur la preview |
| 2 | **Contexte + données** | `requireOrganizationId` → `cache()` + `headers()` ; `createServerFn` retiré des 12 `*.function.ts` ; `lib/api/actions/*` ré-implémenté à signature identique ; 6 handlers de lecture | le gros des 623 tests reste vert ; `lib/api/queries/*` non modifié |
| 3 | **Shell auth** | `app/layout.tsx` complet (QueryClient, Autumn, Tooltip, Toaster), les 4 pages `(auth)`, `/`, `select-organization`, `create-organization` | parcours connexion → choix d'organisation → redirection, sur preview |
| 4 | **Shell dashboard** | `dashboard/layout.tsx` RSC avec les deux gardes, sidebar, header, bannière, `dashboard/page.tsx`, `loading.tsx`, `error.tsx` | `getDashboardRedirectTarget` et `getBillingGateRedirectTarget` restent verts ; navigation sur preview |
| 5 | **Pages listes** | clients, patients, agenda : page RSC, `initialData`, `searchParams` | recherche, pagination, filtres, invalidation après mutation, retour arrière navigateur |
| 6 | **Comptes rendus** | `reports`, `reports/[id]`, `(fullscreen)/…/edit`, **et le PDF serveur (§ 9)** | `ReportPDF.helpers.test.ts` vert, PDF comparé à l'existant, bundle mesuré |
| 7 | **Reste et nettoyage** | settings, assistant, suppression des dépendances TanStack, de `routes/`, `router.tsx`, `routeTree.gen.ts`, `polyfills/`, des 7 `@tanstack/ai*` et de `nitro` ; versions figées ; `AGENTS.md` réécrit | QA complète, `build` vert, tailles de bundle comparées |

## 11. Contraintes dures

1. **Aucune URL ne change.** Des liens de comptes rendus sont partis par email, l'application mobile a des liens profonds, les praticiens ont des signets. Le tableau du § 7 fait foi.
2. **`/api/mobile/v1` ne change pas d'un octet.** L'application Expo en production consomme ce contrat. `openapi-drift.test.ts` est le garde-fou et doit rester vert à chaque tranche.
3. **Aucun changement visuel.** Toute différence d'apparence constatée est un bug de migration, pas une amélioration.

## 12. Vérification

Le filet est la suite de tests existante : **83 des 85 fichiers ne connaissent pas le framework**. La ligne de base mesurée le 5 septembre 2026 est de **623 tests verts et 12 skippés, 84 fichiers passants sur 86, en 6,9 s**. Ils doivent rester verts **à chaque tranche**, pas seulement à la fin. C'est ce qui rend une migration de 64 000 lignes tenable : on déplace du code dont le comportement est déjà sous contrat.

À chaque tranche :

- `bun run check-types`
- `bun --filter @biume/web test`
- déploiement preview Vercel, et parcours manuel du périmètre de la tranche

À la tranche 7 :

- `bun run build` à la racine
- comparaison des tailles de bundle avant/après, avec attention particulière à la page détail d'un compte rendu
- relecture du tableau du § 7, URL par URL

## 13. Risques

Par ordre de gravité.

1. **Dérive de `main` pendant le chantier.** C'est le coût de la stratégie en branche unique, et le seul risque qu'aucune décision technique ne réduit. Voir § 15.
2. **Les paramètres d'URL sur 5 routes** (clients, patients, reports, settings, reset-password). `useSearch()` + `navigate({ search })` deviennent `searchParams` côté serveur et `useSearchParams()` + `router.replace()` côté client. Mécanique, mais facile à casser subtilement : perte d'un filtre au retour arrière, écrasement d'un paramètre lors d'une mise à jour partielle. À tester au clic en tranche 5.
3. **Les 4 pages ex-`ssr: false`.** Elles appellent better-auth côté client. En `"use client"` le comportement est attendu identique, mais le premier rendu doit être vérifié : pas de clignotement d'état non authentifié.
4. **Autumn et uploadthing.** Deux intégrations tierces montées sur des routes attrape-tout. Portage direct attendu ; ce sont les deux endroits où une surprise de configuration est la plus probable.
5. **`@react-pdf/renderer` côté serveur sur Vercel.** `renderToBuffer` fonctionne déjà en production via `email.action.ts`, donc le risque est faible, mais le nouveau handler doit être vérifié sur le runtime Node et non Edge.

## 14. Ce qui est supprimé

- `routes/`, `router.tsx`, `routeTree.gen.ts`, `polyfills/`, `vite.config.ts`
- `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/react-router-ssr-query`, `@tanstack/router-plugin`, `@tanstack/router-cli`, `@tanstack/react-router-devtools`, `@tanstack/devtools-vite`, `@tanstack/react-devtools`, `@tanstack/devtools-event-client`
- les 7 paquets `@tanstack/ai*` (§ 2.4)
- `nitro` (`nitro-nightly`), `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-plugin-neon-new`
- `@react-pdf/renderer` du bundle **client** (la dépendance reste, pour le serveur)
- toutes les versions `latest` du `package.json`

Conservés : `@tanstack/react-query`, `@tanstack/react-form`, `@tanstack/react-table`, `@tanstack/react-store`, `@tanstack/match-sorter-utils` — tous agnostiques du framework.

## 15. Reste à trancher

**Gel des features sur `apps/web` pendant le chantier.** Deux régimes possibles :

- **Gel strict** : aucun commit sur `apps/web` dans `main` jusqu'au merge. Le plus simple, le plus rapide, mais impose de reporter tout correctif de production.
- **Rebase régulier** : `main` continue de vivre, la branche est rebasée à chaque fin de tranche. Plus sûr pour la production, mais chaque rebase coûte d'autant plus cher que les tranches avancées ont réécrit les fichiers concernés.

**En l'absence de décision, le plan d'implémentation retiendra le rebase régulier**, qui couvre les deux cas : si aucun commit ne tombe sur `apps/web`, la procédure ne sert jamais.
