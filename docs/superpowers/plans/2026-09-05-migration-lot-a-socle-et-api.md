# Migration `apps/web` vers Next.js — Lot A : socle et routes API

> **Pour les agents :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe case à cocher (`- [ ]`).

**Objectif :** faire de `apps/web` une application Next.js qui démarre, sans dossier `src/`, et qui sert les 7 routes API à l'identique — y compris le contrat mobile v1 consommé en production.

**Architecture :** on procède en deux temps disjoints. D'abord un déplacement de fichiers en bloc qui ne change aucune ligne de code applicatif (seuls les alias bougent), ce qui garde la suite de tests verte comme point de contrôle. Ensuite l'installation de Next à côté du code existant, puis le portage des routes API — qui délèguent toutes à des fonctions de signature `(request: Request) => Promise<Response>` déjà écrites et déjà testées.

**Pile technique :** Next 16.2.9 (même version que `apps/marketing`), React 19.2.7, Tailwind v4 via `@biume/ui/postcss.config`, Vitest 4, Bun 1.3.11, Hono + `@hono/zod-openapi`, better-auth, Drizzle.

**Spec :** `docs/superpowers/specs/2026-09-05-migration-web-nextjs-design.md`

## Contraintes globales

Reprises de la spec, elles s'appliquent implicitement à toutes les tâches.

- **Aucune URL ne change.** Le tableau du § 7 de la spec fait foi.
- **`/api/mobile/v1` ne change pas d'un octet.** L'application Expo en production consomme ce contrat. `openapi-drift.test.ts` est le garde-fou.
- **Aucun changement visuel.** Toute différence d'apparence est un bug de migration.
- **Next est figé à `16.2.9`**, la version exacte de `apps/marketing`. Pas de `latest`, pas de plage.
- **Bun uniquement.** `bun install`, `bun run <script>`, `bun --filter <pkg> <script>`. Ne pas créer de lockfile npm, Yarn ou pnpm.
- **Ligne de base de tests mesurée le 5 septembre 2026 :** `623 tests passed | 12 skipped (635)`, `84 test files passed | 2 skipped (86)`. **Ce compte ne doit jamais baisser.** Il ne peut qu'augmenter, des tests étant ajoutés par ce plan.
- **Pas de dossier `src/`** dans `apps/web` à l'issue de la tâche 1.
- Le dossier `routes/` reste sur disque pendant tout le lot A. Il est supprimé au lot E.
- **Écart assumé avec la spec.** Le § 10 de la spec prévoyait d'exclure `routes/` du `tsconfig` en tranche 0. Ce plan fait plus strict : les dépendances TanStack restent installées et `routes/` **continue de compiler** pendant tout le lot A. Une exclusion du `tsconfig` masquerait des erreurs de types dans du code encore vivant ; les garder sous contrôle du compilateur ne coûte rien tant que rien n'est supprimé.

## Structure des fichiers

| Fichier | Responsabilité | Tâche |
| --- | --- | --- |
| `apps/web/package.json` | alias `#/*` et `@/*`, dépendances Next, scripts | 1, 2 |
| `apps/web/tsconfig.json` | chemins TypeScript, plugin `next`, `include` | 1, 2 |
| `apps/web/styles.css` | directives `@source` de Tailwind, recalées d'un niveau | 1 |
| `apps/web/trigger.config.ts` | `dirs` | 1 |
| `apps/web/next.config.ts` | configuration Next, paquets serveur externes | 2 |
| `apps/web/postcss.config.mjs` | réexport de la config partagée | 2 |
| `apps/web/eslint.config.mjs` | config ESLint Next (absente aujourd'hui) | 2 |
| `apps/web/app/layout.tsx` | squelette HTML minimal, complété au lot C | 2 |
| `apps/web/app/page.tsx` | page provisoire, remplacée au lot C | 2 |
| `apps/web/app/api/auth/[...all]/route.ts` | délégation à `auth.handler` | 3 |
| `apps/web/app/api/autumn/[...all]/route.ts` | délégation à `autumnApiHandler` | 3 |
| `apps/web/app/api/uploadthing/route.ts` | délégation à `uploadThingHandler` | 3 |
| `apps/web/app/api/chat/route.ts` | délégation à `handleChatRequest` | 3 |
| `apps/web/app/api/vulgarisation/route.ts` | délégation à `handleVulgarisationRequest` | 3 |
| `apps/web/app/api/mobile/v1/[[...path]]/route.ts` | délégation à `handleMobileApiRequest` | 4 |
| `apps/web/app/api/owner/[...all]/route.ts` | délégation à `handleOwnerApiRequest` | 4 |
| `apps/web/app/api/**/route.test.ts` | preuve que la requête est transmise intacte | 3, 4 |

**Un fichier de route = une responsabilité : traduire la convention de Next vers un handler `(Request) => Promise<Response>` existant.** Aucune logique métier n'entre dans `app/api/`. Si une tâche vous pousse à écrire de la logique dans un `route.ts`, c'est que la logique manque dans `server/` et il faut l'y mettre.

---

### Tâche 1 : supprimer le dossier `src/`

Déplacement en bloc. **Aucun fichier applicatif n'est édité** : les 17 fichiers à imports relatifs conservent leurs chemins puisque tout se déplace ensemble, et les imports `#/` sont absorbés par le changement d'alias.

**Fichiers :**
- Déplacer : `apps/web/src/*` → `apps/web/*`
- Modifier : `apps/web/package.json` (champ `imports`)
- Modifier : `apps/web/tsconfig.json` (`compilerOptions.paths`)
- Modifier : `apps/web/styles.css:7-8` (directives `@source`)
- Modifier : `apps/web/trigger.config.ts` (champ `dirs`)

**Interfaces :**
- Consomme : rien.
- Produit : l'alias `#/*` résout désormais vers `apps/web/*`. Toutes les tâches suivantes écrivent des imports `#/server/...` qui pointent vers `apps/web/server/...`.

- [ ] **Étape 1 : enregistrer la ligne de base**

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2
bun --filter @biume/web test 2>&1 | tail -5
```

Attendu — notez ces chiffres, ils servent de référence à toutes les tâches :

```
Test Files  84 passed | 2 skipped (86)
     Tests  623 passed | 12 skipped (635)
```

Si le compte diffère, **arrêtez-vous** : `main` a bougé. Reprenez la ligne de base et signalez l'écart avant de continuer.

- [ ] **Étape 2 : déplacer le contenu de `src/` d'un niveau**

`git mv` préserve l'historique fichier par fichier, ce qui rend la revue lisible.

```bash
cd apps/web
for entry in src/*; do git mv "$entry" "$(basename "$entry")"; done
rmdir src
ls
```

Attendu : `app` n'existe pas encore, mais `components`, `functions`, `hooks`, `integrations`, `lib`, `polyfills`, `routes`, `server`, `trigger`, `router.tsx`, `routeTree.gen.ts`, `styles.css`, `empty.ts` sont à la racine de `apps/web`.

- [ ] **Étape 3 : recaler l'alias dans `package.json`**

Dans `apps/web/package.json` :

```jsonc
  "imports": {
    "#/*": "./*"
  },
```

- [ ] **Étape 4 : recaler les chemins dans `tsconfig.json`**

Dans `apps/web/tsconfig.json`, `compilerOptions.paths` :

```jsonc
    "paths": {
      "#/*": ["./*"],
      "@/*": ["./*"],
    },
```

- [ ] **Étape 5 : recaler les directives `@source` de Tailwind**

`styles.css` est passé de `apps/web/src/` à `apps/web/`, donc ses chemins relatifs ont perdu un niveau. Dans `apps/web/styles.css`, remplacer les deux dernières lignes :

```css
@source "./**/*.{ts,tsx}";
@source "../../packages/ui/src/**/*.{ts,tsx}";
```

La première ligne est inchangée dans son texte mais couvre désormais toute l'application ; la seconde perd un `../`. Sans cette correction, Tailwind ne voit plus les classes de `packages/ui` et **la moitié des styles disparaît silencieusement, sans erreur de build**.

- [ ] **Étape 6 : recaler `trigger.config.ts`**

```ts
  dirs: ["trigger"],
```

- [ ] **Étape 7 : vérifier que les trois chaînes d'outils résolvent encore `#/`**

C'est le vrai risque de cette tâche : `#/` est résolu par trois mécanismes distincts — le champ `imports` de `package.json` pour les bundlers, `paths` de `tsconfig` pour TypeScript, et la résolution propre à Vitest. Les deux commandes ci-dessous les couvrent tous les trois. Le bundler de Next est le quatrième consommateur, vérifié à la tâche 2.

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
```

Attendu : `check-types` sans erreur, et **exactement** `623 passed | 12 skipped`. Une erreur `Cannot find module '#/...'` signifie que l'une des deux étapes d'alias est incomplète.

- [ ] **Étape 8 : commit**

```bash
git add -A apps/web
git commit -m "refactor(web): sortir l'application du dossier src

Déplacement en bloc de src/* vers la racine de apps/web, pour aligner
la forme sur apps/marketing avant la migration vers Next. Aucun fichier
applicatif n'est édité : les imports relatifs gardent leur distance et
les imports #/ sont absorbés par les alias de package.json et tsconfig.

Les directives @source de styles.css perdent un niveau, sans quoi
Tailwind cesse silencieusement de voir les classes de packages/ui."
```

---

### Tâche 2 : faire démarrer Next

Next est installé **à côté** du code TanStack existant, qui reste sur disque. À l'issue de la tâche, l'application sert une page provisoire ; les vraies pages arrivent au lot C.

**Fichiers :**
- Créer : `apps/web/next.config.ts`
- Créer : `apps/web/postcss.config.mjs`
- Créer : `apps/web/eslint.config.mjs`
- Créer : `apps/web/app/layout.tsx`
- Créer : `apps/web/app/page.tsx`
- Modifier : `apps/web/package.json` (dépendances et scripts)
- Modifier : `apps/web/tsconfig.json` (`plugins`, `include`, `jsx`)

**Interfaces :**
- Consomme : l'alias `#/*` → `apps/web/*` de la tâche 1.
- Produit : `app/layout.tsx` exportant `RootLayout` par défaut. Le lot C le remplacera par la version complète (providers). Les tâches 3 et 4 déposent des fichiers sous `app/api/`.

- [ ] **Étape 1 : installer Next et ESLint, retirer le socle Vite**

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2
bun add --filter @biume/web next@16.2.9
bun add --filter @biume/web --dev eslint-config-next@16.2.9
bun remove --filter @biume/web nitro vite-plugin-neon-new @tailwindcss/vite
bun remove --filter @biume/web --dev @vitejs/plugin-react
```

`vite` et `vitest` restent : Vitest en dépend et les 623 tests tournent dessus.

Les paquets TanStack (`@tanstack/react-start`, `@tanstack/react-router`, les devtools, les 7 `@tanstack/ai*`) **restent installés jusqu'au lot E** : `routes/` et `router.tsx` sont encore sur disque et doivent continuer de compiler.

- [ ] **Étape 2 : écrire `next.config.ts`**

Créer `apps/web/next.config.ts` :

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },
  // `pg` charge des binaires natifs et `@react-pdf/renderer` embarque fontkit :
  // les laisser hors du bundle serveur évite des échecs de build opaques dès
  // que l'API mobile touche la base (tâche 4) et que le PDF passe côté serveur
  // (lot D).
  serverExternalPackages: ["pg", "@react-pdf/renderer"],
};

export default nextConfig;
```

- [ ] **Étape 3 : écrire `postcss.config.mjs` et `eslint.config.mjs`**

`apps/web/postcss.config.mjs` — même réexport que `apps/marketing` :

```js
export { default } from "@biume/ui/postcss.config";
```

`apps/web/eslint.config.mjs` — `apps/web` a un script `lint` mais aucun fichier de configuration ; on comble le trou avec la config de `apps/marketing` :

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

- [ ] **Étape 4 : écrire le squelette `app/`**

Créer `apps/web/app/layout.tsx`. Volontairement minimal : les providers (QueryClient, Autumn, Tooltip, Toaster) arrivent au lot C, avec les pages qui en ont besoin.

```tsx
import type { Metadata, Viewport } from "next";

import "../styles.css";

export const metadata: Metadata = {
  title: "Biume",
  description:
    "Biume centralise le suivi des propriétaires, rendez-vous et rapports vétérinaires.",
  // L'application ne doit jamais apparaître dans les résultats de recherche :
  // toute l'acquisition passe par biume.com.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
```

Créer `apps/web/app/page.tsx`. Provisoire, remplacée au lot C par la redirection selon session :

```tsx
export default function Page() {
  return <main>Socle Next en place. Les pages arrivent au lot C.</main>;
}
```

- [ ] **Étape 5 : recaler `tsconfig.json` et les scripts**

Dans `apps/web/tsconfig.json`, `compilerOptions` :

```jsonc
    "jsx": "preserve",
    "plugins": [{ "name": "next" }],
```

`"jsx": "react-jsx"` devient `"preserve"` : Next gère lui-même la transformation JSX. Retirer aussi `"types": ["vite/client"]`, qui n'a plus d'objet.

**Retirer `vite/client` casse le seul `import.meta.env` de l'application** — l'étape 6 le corrige. Ne pas lancer `check-types` entre les deux, il échouera.

Dans `include`, retirer `"vite.config.js"` et ajouter :

```jsonc
    "next-env.d.ts",
    "next.config.ts",
    ".next/types/**/*.ts",
```

Dans `apps/web/package.json`, remplacer les scripts `dev`, `build`, `preview` — le port 3001 est celui que servait Vite et que les autres apps attendent :

```jsonc
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001",
```

Supprimer les scripts `preview` et `generate-routes` (ce dernier ne sert qu'à `routeTree.gen.ts`, supprimé au lot E).

- [ ] **Étape 6 : migrer l'unique `import.meta.env`**

`components/auth/auth-layout.tsx:15` est le seul endroit de l'application qui lit `import.meta.env`. Next expose les variables publiques par `process.env` avec le préfixe `NEXT_PUBLIC_`.

Remplacer :

```ts
  import.meta.env.VITE_MARKETING_APP_URL?.replace(/\/$/, "") ??
```

par :

```ts
  process.env.NEXT_PUBLIC_MARKETING_APP_URL?.replace(/\/$/, "") ??
```

Puis, dans `turbo.json`, remplacer `"VITE_MARKETING_APP_URL"` par `"NEXT_PUBLIC_MARKETING_APP_URL"` dans la liste `tasks.build.env`.

`VITE_POSTHOG_HOST` et `VITE_POSTHOG_KEY` restent tels quels dans `turbo.json` : aucun fichier de l'application ne les lit, ils sont déclarés sans être utilisés. Les nettoyer est du ressort du lot E, pas d'ici.

**Action hors dépôt, à ne pas oublier :** ajouter `NEXT_PUBLIC_MARKETING_APP_URL` aux variables d'environnement du projet Vercel, avec la valeur de `VITE_MARKETING_APP_URL`. Sans elle, le lien de retour vers le site marketing sur les écrans de connexion tombe sur la valeur de repli.

Vérifier qu'il n'en reste aucun autre :

```bash
grep -rn "import.meta.env" apps/web --include="*.ts" --include="*.tsx"
```

Attendu : aucun résultat.

- [ ] **Étape 7 : vérifier que Next démarre et que Vitest résout toujours `#/`**

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2
bun --filter @biume/web test 2>&1 | tail -5
bun --filter @biume/web dev &
sleep 15
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/
kill %1
```

Attendu : toujours `623 passed | 12 skipped`, et `200` sur `/`.

Si Vitest échoue sur `Cannot find module '#/...'`, c'est la troisième chaîne de résolution évoquée en tâche 1 : ajouter l'alias explicitement dans `apps/web/vitest.config.ts`, à côté des alias React déjà présents :

```ts
    alias: {
      "#": fileURLToPath(new URL(".", import.meta.url)),
      // … alias React existants, à conserver tels quels
    },
```

- [ ] **Étape 8 : commit**

```bash
git add -A apps/web turbo.json
git commit -m "build(web): installer Next 16.2.9 et le socle de configuration

next.config.ts, postcss partagé, config ESLint (absente jusqu'ici malgré
le script lint), et un app/layout.tsx minimal qui sert une page provisoire.
Le code TanStack reste sur disque et compile encore : il est retiré au lot E.

pg et @react-pdf/renderer sont déclarés en serverExternalPackages avant
d'en avoir besoin, pour éviter des échecs de build opaques aux tâches
suivantes."
```

---

### Tâche 3 : porter les cinq routes API simples

Les cinq routes délèguent chacune à une fonction `(request: Request) => Promise<Response>` déjà écrite dans `server/`. Le portage ne fait que traduire la convention de déclaration.

Deux différences assumées avec l'existant :

1. **Import statique plutôt que `await import()`.** Le `import()` dynamique servait à tenir le code serveur hors du bundle client sous TanStack Start. Un `route.ts` de Next est serveur par construction : l'import statique est plus simple et charge le module à l'initialisation de la route plutôt qu'à chaque requête.
2. **`runtime = "nodejs"` déclaré explicitement.** better-auth, Drizzle et `pg` ont besoin du runtime Node. C'est le défaut de Next, mais l'écrire empêche qu'un passage à Edge se fasse par inadvertance.

**Fichiers :**
- Créer : `apps/web/app/api/auth/[...all]/route.ts` et `route.test.ts`
- Créer : `apps/web/app/api/autumn/[...all]/route.ts`
- Créer : `apps/web/app/api/uploadthing/route.ts`
- Créer : `apps/web/app/api/chat/route.ts`
- Créer : `apps/web/app/api/vulgarisation/route.ts`

**Interfaces :**
- Consomme : `auth.handler` de `@biume/auth` ; `autumnApiHandler` de `#/server/autumn` ; `uploadThingHandler` de `#/server/uploadthing` ; `handleChatRequest` de `#/server/ai/chat` ; `handleVulgarisationRequest` de `#/server/ai/vulgarisation`. Toutes de type `(request: Request) => Promise<Response>`.
- Produit : les URL `/api/auth/*`, `/api/autumn/*`, `/api/uploadthing`, `/api/chat`, `/api/vulgarisation`, servies par Next.

- [ ] **Étape 1 : écrire le test qui échoue**

Le comportement à garantir n'est pas « le chat répond » — c'est **« la requête est transmise intacte au handler »**. C'est exactement ce qu'une migration peut casser : une URL réécrite, un corps consommé, une méthode perdue.

Créer `apps/web/app/api/auth/[...all]/route.test.ts` :

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@biume/auth", () => ({
  auth: {
    handler: vi.fn(
      async (request: Request) =>
        new Response(
          JSON.stringify({ url: request.url, method: request.method }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
    ),
  },
}));

describe("route /api/auth/[...all]", () => {
  it("transmet une requête GET intacte à auth.handler", async () => {
    const { GET } = await import("./route");
    const request = new Request(
      "http://localhost:3001/api/auth/get-session?x=1",
      { method: "GET" },
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "http://localhost:3001/api/auth/get-session?x=1",
      method: "GET",
    });
  });

  it("transmet une requête POST intacte à auth.handler", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost:3001/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.c" }),
    });

    const response = await POST(request);

    await expect(response.json()).resolves.toEqual({
      url: "http://localhost:3001/api/auth/sign-in/email",
      method: "POST",
    });
  });
});
```

- [ ] **Étape 2 : lancer le test et vérifier qu'il échoue**

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2
bun --filter @biume/web test app/api/auth
```

Attendu : ÉCHEC, `Failed to load url ./route` — le fichier n'existe pas.

- [ ] **Étape 3 : écrire les cinq routes**

`apps/web/app/api/auth/[...all]/route.ts` :

```ts
import { auth } from "@biume/auth";

export const runtime = "nodejs";

export const GET = (request: Request) => auth.handler(request);
export const POST = (request: Request) => auth.handler(request);
```

`apps/web/app/api/autumn/[...all]/route.ts` :

```ts
import { autumnApiHandler } from "#/server/autumn";

export const runtime = "nodejs";

export const GET = (request: Request) => autumnApiHandler(request);
export const POST = (request: Request) => autumnApiHandler(request);
```

`apps/web/app/api/uploadthing/route.ts` :

```ts
import { uploadThingHandler } from "#/server/uploadthing";

export const runtime = "nodejs";

export const GET = (request: Request) => uploadThingHandler(request);
export const POST = (request: Request) => uploadThingHandler(request);
```

`apps/web/app/api/chat/route.ts` :

```ts
import { handleChatRequest } from "#/server/ai/chat";

export const runtime = "nodejs";

// Le streaming du Vercel AI SDK passe par la Response renvoyée telle quelle :
// ne jamais la reconstruire ici, ce qui romprait le flux.
export const POST = (request: Request) => handleChatRequest(request);
```

`apps/web/app/api/vulgarisation/route.ts` :

```ts
import { handleVulgarisationRequest } from "#/server/ai/vulgarisation";

export const runtime = "nodejs";

export const POST = (request: Request) => handleVulgarisationRequest(request);
```

- [ ] **Étape 4 : lancer le test et vérifier qu'il passe**

```bash
bun --filter @biume/web test app/api/auth
```

Attendu : `2 passed`.

- [ ] **Étape 5 : vérifier la suite complète et le build**

```bash
bun --filter @biume/web test 2>&1 | tail -5
bun --filter @biume/web check-types
bun --filter @biume/web build 2>&1 | tail -20
```

Attendu : au moins `625 passed` (623 + les 2 nouveaux), aucune erreur de types, et un build qui liste les 5 routes sous `/api`.

- [ ] **Étape 6 : vérifier la connexion de bout en bout**

Le test unitaire prouve la transmission, pas que better-auth fonctionne réellement derrière Next.

```bash
bun --filter @biume/web dev &
sleep 15
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/auth/get-session
kill %1
```

Attendu : `200` (une session absente renvoie `200` avec un corps nul, pas une erreur). Un `404` signifie que le segment attrape-tout est mal nommé : Next exige `[...all]`, pas `$`.

- [ ] **Étape 7 : commit**

```bash
git add -A apps/web/app
git commit -m "feat(web): porter les cinq routes API simples vers Next

auth, autumn, uploadthing, chat et vulgarisation délèguent toutes à une
fonction (Request) => Promise<Response> déjà écrite : seule la convention
de déclaration change. Import statique plutôt que import() dynamique,
un route.ts étant serveur par construction, et runtime nodejs déclaré
explicitement pour que better-auth et Drizzle ne basculent pas sur Edge.

Le test garantit ce qu'une migration peut casser : la requête arrive
intacte, URL et méthode comprises."
```

---

### Tâche 4 : porter les deux API Hono

`/api/mobile/v1` est le point le plus sensible du lot : l'application Expo en production le consomme. Les deux applications Hono appellent `.basePath()` et routent elles-mêmes sur l'URL complète — elles reçoivent donc la `Request` sans aucune transformation.

Le segment mobile est `[[...path]]` (attrape-tout **optionnel**) et non `[...path]` : l'optionnel fait aussi correspondre `/api/mobile/v1` sans suffixe, que le `[...path]` seul laisserait en 404.

**Fichiers :**
- Créer : `apps/web/app/api/mobile/v1/[[...path]]/route.ts` et `route.test.ts`
- Créer : `apps/web/app/api/owner/[...all]/route.ts`

**Interfaces :**
- Consomme : `handleMobileApiRequest` de `#/server/mobile/mobile-api` et `handleOwnerApiRequest` de `#/server/owner/owner-api.ports`, toutes deux `(request: Request) => Promise<Response>`.
- Produit : les URL `/api/mobile/v1/*` et `/api/owner/*`, servies par Next avec un contrat inchangé.

- [ ] **Étape 1 : écrire le test qui échoue**

Créer `apps/web/app/api/mobile/v1/[[...path]]/route.test.ts` :

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("#/server/mobile/mobile-api", () => ({
  handleMobileApiRequest: vi.fn(
    async (request: Request) =>
      new Response(
        JSON.stringify({ url: request.url, method: request.method }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
  ),
}));

describe("route /api/mobile/v1/[[...path]]", () => {
  it("transmet le chemin complet, base comprise, à l'application Hono", async () => {
    const { GET } = await import("./route");
    const request = new Request(
      "http://localhost:3001/api/mobile/v1/agenda?from=2026-09-05",
      { method: "GET" },
    );

    const response = await GET(request);

    // L'application Hono fait .basePath("/api/mobile/v1") et route sur l'URL
    // entière : la moindre réécriture du chemin ici casserait tout l'agenda.
    await expect(response.json()).resolves.toEqual({
      url: "http://localhost:3001/api/mobile/v1/agenda?from=2026-09-05",
      method: "GET",
    });
  });

  it("expose les trois méthodes que servait la route TanStack", async () => {
    const route = await import("./route");

    expect(typeof route.GET).toBe("function");
    expect(typeof route.POST).toBe("function");
    expect(typeof route.DELETE).toBe("function");
  });
});
```

- [ ] **Étape 2 : lancer le test et vérifier qu'il échoue**

```bash
bun --filter @biume/web test app/api/mobile
```

Attendu : ÉCHEC, `Failed to load url ./route`.

- [ ] **Étape 3 : écrire les deux routes**

`apps/web/app/api/mobile/v1/[[...path]]/route.ts` — les trois méthodes sont celles que déclarait `routes/api/mobile/v1/$.ts`, ni plus ni moins :

```ts
import { handleMobileApiRequest } from "#/server/mobile/mobile-api";

export const runtime = "nodejs";

export const GET = (request: Request) => handleMobileApiRequest(request);
export const POST = (request: Request) => handleMobileApiRequest(request);
export const DELETE = (request: Request) => handleMobileApiRequest(request);
```

`apps/web/app/api/owner/[...all]/route.ts` :

```ts
import { handleOwnerApiRequest } from "#/server/owner/owner-api.ports";

export const runtime = "nodejs";

export const GET = (request: Request) => handleOwnerApiRequest(request);
export const POST = (request: Request) => handleOwnerApiRequest(request);
```

- [ ] **Étape 4 : lancer le test et vérifier qu'il passe**

```bash
bun --filter @biume/web test app/api/mobile
```

Attendu : `2 passed`.

- [ ] **Étape 5 : vérifier le contrat mobile**

C'est la vérification qui compte pour ce lot.

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2
bun --filter @biume/web test server/mobile 2>&1 | tail -8
bun --filter @biume/web test 2>&1 | tail -5
```

Attendu : les fichiers `mobile-api.*.test.ts` et `openapi-drift.test.ts` verts, et au moins `627 passed` sur la suite complète.

**Si `openapi-drift.test.ts` échoue, arrêtez-vous.** Le contrat consommé par l'application Expo en production a bougé ; c'est un échec de migration, jamais un test à mettre à jour.

- [ ] **Étape 6 : vérifier le service réel**

```bash
bun --filter @biume/web dev &
sleep 15
curl -s -o /dev/null -w "sans auth: %{http_code}\n" http://localhost:3001/api/mobile/v1/agenda
curl -s -o /dev/null -w "racine v1: %{http_code}\n" http://localhost:3001/api/mobile/v1
kill %1
```

Attendu : `401` sur `/agenda` (la route est servie et rejette l'absence de session — un `404` signifierait qu'elle n'est pas montée), et une réponse de l'application Hono sur la racine, pas un `404` de Next. Ce second appel est ce qui justifie le segment optionnel `[[...path]]`.

- [ ] **Étape 7 : commit**

```bash
git add -A apps/web/app
git commit -m "feat(web): porter les deux API Hono vers Next

mobile v1 et propriétaire délèguent à des applications Hono qui font
leur propre .basePath() et routent sur l'URL complète : la Request est
transmise sans transformation.

Le segment mobile est [[...path]] et non [...path] : l'attrape-tout
optionnel fait aussi correspondre /api/mobile/v1 sans suffixe.

openapi-drift.test.ts reste vert, donc le contrat consommé par
l'application Expo en production est inchangé."
```

---

## Fin du lot A

État atteint :

- `apps/web` n'a plus de dossier `src/` et a la même forme que `apps/marketing`.
- Next 16.2.9 démarre sur le port 3001 et sert une page provisoire.
- Les 7 routes API sont servies par Next, avec des URL et un contrat inchangés.
- La suite de tests est passée de 623 à au moins 627 tests verts.
- Le code TanStack est encore sur disque et compile ; rien n'a été supprimé.

Ce que le lot A ne fait pas : aucune page de l'application n'est utilisable par un praticien. C'est attendu — l'application est à ce stade un serveur d'API correct, vérifiable par l'application Expo pointée sur la preview, et par les 627 tests.

**Suite :** le lot B (tranche 2 de la spec) porte le contexte de requête et la couche données. Son plan est écrit à la fin du lot A, contre l'état réel du code plutôt que contre une prédiction.
