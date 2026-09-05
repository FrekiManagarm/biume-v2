# Migration `apps/web` vers Next.js — Lot C : shell d'authentification et shell dashboard

> **Pour les agents :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe case à cocher (`- [ ]`).

**Objectif :** rendre l'application utilisable. À l'issue de ce lot, un praticien se connecte, choisit son entreprise et voit son tableau de bord — servis par Next, plus par TanStack.

**Architecture :** les gardes deviennent des Server Components. `app/dashboard/layout.tsx` fait ce que faisait `beforeLoad` : un appel à `getDashboardShellFn`, deux fonctions pures de décision, et `redirect()` de `next/navigation`. Les pages tirent leur premier rendu côté serveur et passent la donnée en `initialData` aux îlots clients, qui gardent TanStack Query pour la suite.

**Pile technique :** Next 16.2.9, React 19.2.7, TanStack Query (conservé), better-auth, Autumn, Tailwind v4, Vitest 4, Bun 1.3.11.

**Spec :** `docs/superpowers/specs/2026-09-05-migration-web-nextjs-design.md` (tranches 3 et 4 du § 10)

**Lots précédents :** lot A `9f9fe778..52f2f9ab`, lot B `756e85e7..e0abea0e`.

## Contraintes globales

- **Aucune URL ne change.** Le § 7 de la spec fait foi. Ce lot sert enfin ces URL ; toute divergence est un bug.
- **`/api/mobile/v1` et `/api/owner/v1` ne bougent pas.** `openapi-drift.test.ts` reste vert.
- **Aucun changement visuel.** Les composants de rendu ne sont pas retouchés : ce lot déplace le câblage, pas l'interface. Une différence d'apparence est un bug de migration, pas une amélioration.
- **Ligne de base au départ du lot : `651 passed | 12 skipped (663)`, `94 files passed | 2 skipped (96)`.** Ce compte ne doit jamais baisser.
- **`check-types` en code 0** à la fin de chaque tâche.
- Le dossier `routes/` reste sur disque et doit continuer de compiler jusqu'au lot E. Il n'est plus servi dès qu'une page `app/` porte la même URL — Next ne connaît que `app/`.
- **Bun uniquement.** `bun --filter @biume/web <script>` pour `test`, `check-types`, `build`, `lint` ; `bun add --cwd=apps/web` pour les dépendances.
- `bun --filter @biume/web lint` sort en code non nul (constats préexistants). Ce n'est pas un point de contrôle.

## Les six règles héritées des lots A et B

Elles ne sont écrites nulle part ailleurs et elles lient ce lot.

1. **Une lecture serveur importe la fonction depuis `*.function.ts`, jamais l'enveloppe de `*.action.ts`.** L'enveloppe fait un `fetch` sur une URL relative : appelée depuis un Server Component, Node lève `TypeError: Failed to parse URL`. C'est aussi le seul moyen d'honorer le « aucun RPC » du § 5.3 de la spec. La règle est écrite en tête de `lib/http/internal-fetch.ts`.
2. **Dans un `*.action.ts`, tout import vers `*.function.ts` est en position de type.** Ces fichiers sont consommés par des composants clients ; un import de valeur ferait entrer Drizzle dans le bundle du navigateur, sans qu'aucun test ne le signale.
3. **Une directive `"use server"` s'applique au fichier entier** et fait de chaque export un identifiant de Server Action appelable depuis le réseau. Les lectures n'y ont pas leur place.
4. **`z.input`, pas `z.infer`, pour tout schéma portant un `.default(...)`.**
5. **Une construction inerte sous TanStack peut devenir porteuse sous Next, et l'inverse est vrai aussi.** Le § 13 de la spec porte les deux instances connues. Ce lot en traite une (voir tâche 1).
6. **Le compte de tests ne baisse jamais.** C'est le seul filet qui traverse tout le chantier.

## Trois décisions d'architecture, à comprendre avant de commencer

### `cache()` opère enfin

Le lot B a posé `requireOrganizationId` sur `cache()` de React, et la revue finale a établi qu'il **ne mémoïse pas dans un route handler**. Il mémoïse dans un Server Component. Ce lot est donc le premier où le gain du § 5.4 est réel : une page dashboard qui appelle douze fonctions ne lira la session qu'une fois.

Conséquence pratique : **ne cherchez pas à optimiser les appels serveur en les regroupant à la main.** Appelez les fonctions là où le besoin est, `cache()` fait le reste — et seulement dans les Server Components.

### La composition de l'aperçu est partagée

`app/api/internal/dashboard/overview/route.ts` compose cinq lectures. La page `app/dashboard/page.tsx` a besoin exactement du même objet, pour son premier rendu. **Recopier la composition serait la faire diverger au premier changement.**

Elle est donc extraite dans une fonction ordinaire que les deux appellent. Le handler garde son rôle — servir le client qui change de date — et la page l'appelle directement, sans passer par le réseau.

### `preload` n'existe plus

`getDashboardShellFn` prend un `preload` qui vaut `true` quand TanStack précharge une route au survol d'un lien. Next n'a pas cet équivalent : un layout s'exécute sur une navigation réelle. **Passez toujours `preload: false`.** Le paramètre reste dans la signature tant que `routes/` compile ; le lot E le retirera.

## Structure des fichiers

| Fichier | Responsabilité | Tâche |
| --- | --- | --- |
| `apps/web/lib/api/actions/action-result.ts` | **nouveau** — la forme de retour des mutations | 1 |
| `apps/web/app/providers.tsx` | **nouveau** — `"use client"`, QueryClient par requête, Autumn, Tooltip, Toaster | 2 |
| `apps/web/app/layout.tsx` | shell HTML complet (remplace le provisoire du lot A) | 2 |
| `apps/web/app/page.tsx` | `/` → redirection | 3 |
| `apps/web/app/(auth)/{signin,signup,forgot-password,reset-password}/page.tsx` | les 4 pages ex-`ssr: false` | 3 |
| `apps/web/app/select-organization/page.tsx` | garde + choix d'entreprise | 4 |
| `apps/web/app/create-organization/page.tsx` | garde + création | 4 |
| `apps/web/middleware.ts` | **nouveau** — pose le chemin courant dans un en-tête pour le layout | 5 |
| `apps/web/app/dashboard/layout.tsx` | **le cœur du lot** : deux gardes en RSC, shell | 5 |
| `apps/web/lib/dashboard-guards.ts` | **nouveau** — les fonctions pures de décision, déplacées hors de `routes/` | 5 |
| `apps/web/app/dashboard/page.tsx` | aperçu, premier rendu en RSC | 6 |
| `apps/web/app/dashboard/{loading,error}.tsx` | ex-`pendingComponent` / `errorComponent` | 6 |
| `apps/web/server/dashboard/overview.ts` | **nouveau** — la composition partagée | 6 |

**Ce que ce lot ne crée pas :** aucune page de `dashboard/{agenda,clients,patients,reports,settings,assistant}`. Elles arrivent aux lots D et suivants. Après ce lot, ces URL rendront un 404 de Next — c'est attendu et documenté, pas une régression : elles n'étaient déjà plus servies depuis le lot A.

---

### Tâche 1 : le contrat d'erreur des Server Actions

**Pourquoi d'abord.** Toutes les tâches suivantes écrivent des pages qui appellent des mutations. Le contrat doit exister avant, sans quoi six tâches inventeront six formes.

Le § 13 de la spec le documente : `createServerFn` propageait le message d'une erreur jusqu'au client ; **une Server Action de Next le remplace en production par un texte générique**. `apps/web/functions/` contient 26 `throw new Error("<message en français destiné au praticien>")`. En développement Next ne censure pas : le défaut ne se voit qu'en preview ou en production.

Le motif correct existe déjà dans le dépôt : `lib/api/actions/report-reminder.action.ts:94-98` renvoie `{ success: false, error }` au lieu de lever.

**Fichiers :**
- Créer : `apps/web/lib/api/actions/action-result.ts` et `action-result.test.ts`
- Modifier : `apps/web/lib/api/actions/auth.mutations.ts`, `organization.mutations.ts`, `user.mutations.ts`

**Interfaces :**
- Produit : `type ActionResult<T>`, et `toActionResult(fn)` qui enveloppe une mutation. Les tâches 3 à 6 les consomment.

**Périmètre volontairement étroit.** Ce lot n'applique le contrat qu'aux **trois** modules de mutations que ses pages exercent : `auth` (`switchActiveOrganization`), `organization` (`updateOrganization`), `user` (`updateUserNotifications`). Les six autres modules — clients, patients, appointments, medicalDocuments, reports, reportOwnerContent — sont exercés par les pages des lots D et suivants, qui les convertiront en même temps que leur page. **Convertir les 22 mutations ici serait toucher du code qu'aucune page de ce lot n'appelle**, sans pouvoir le vérifier au clic.

- [ ] **Étape 1 : écrire le test qui échoue**

Créer `apps/web/lib/api/actions/action-result.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { toActionResult } from "./action-result";

describe("toActionResult", () => {
  it("rend le résultat de la fonction en cas de succès", async () => {
    const run = toActionResult(async (n: number) => n * 2);

    await expect(run(21)).resolves.toEqual({ success: true, data: 42 });
  });

  it("capture le message d'une Error plutôt que de la laisser remonter", async () => {
    // C'est tout l'objet du contrat : une Error qui traverse la frontière
    // Server Action voit son message remplacé par un texte générique en
    // production. Capturé ici, le message français atteint le praticien.
    const run = toActionResult(async () => {
      throw new Error("Client introuvable ou inaccessible.");
    });

    await expect(run()).resolves.toEqual({
      success: false,
      error: "Client introuvable ou inaccessible.",
    });
  });

  it("rend un message générique pour une valeur levée qui n'est pas une Error", async () => {
    const run = toActionResult(async () => {
      throw "chaîne nue";
    });

    const result = await run();

    expect(result.success).toBe(false);
    expect(typeof (result as { error: string }).error).toBe("string");
  });

  it("laisse passer les erreurs de contrôle de flux de Next", async () => {
    // `redirect()` et `notFound()` de Next lèvent une erreur que le framework
    // intercepte. La capturer la transformerait en message affiché, et la
    // redirection n'aurait jamais lieu.
    const digest = Object.assign(new Error("NEXT_REDIRECT"), {
      digest: "NEXT_REDIRECT;replace;/signin;307;",
    });
    const run = toActionResult(async () => {
      throw digest;
    });

    await expect(run()).rejects.toBe(digest);
  });
});
```

- [ ] **Étape 2 : lancer le test et vérifier qu'il échoue**

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2
bun --filter @biume/web test lib/api/actions/action-result
```

Attendu : ÉCHEC, `Failed to load url ./action-result`.

- [ ] **Étape 3 : écrire `action-result.ts`**

```ts
/**
 * La forme de retour des Server Actions.
 *
 * `createServerFn` de TanStack propageait le message d'une `Error` jusqu'au
 * client. Une Server Action de Next le remplace en production par un texte
 * générique, pour ne pas fuiter d'information serveur — et `apps/web/functions`
 * contient 26 `throw new Error("<message français destiné au praticien>")`
 * qui deviendraient tous illisibles. En développement Next ne censure pas :
 * le défaut ne se verrait qu'en production.
 *
 * Capturer le message côté serveur et le renvoyer comme donnée le fait
 * traverser intact.
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const GENERIC_ERROR = "Une erreur est survenue. Réessayez.";

/**
 * Les erreurs de contrôle de flux de Next — celles que lèvent `redirect()` et
 * `notFound()` — portent un `digest` que le framework intercepte plus haut.
 * Les capturer transformerait une redirection en message affiché.
 */
function isFrameworkControlFlow(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_")
  );
}

export function toActionResult<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<ActionResult<T>> {
  return async (...args: Args) => {
    try {
      return { success: true, data: await fn(...args) };
    } catch (error) {
      if (isFrameworkControlFlow(error)) {
        throw error;
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : GENERIC_ERROR,
      };
    }
  };
}
```

- [ ] **Étape 4 : lancer le test et vérifier qu'il passe**

```bash
bun --filter @biume/web test lib/api/actions/action-result
```

Attendu : `4 passed`.

- [ ] **Étape 5 : appliquer aux trois modules de mutations du lot**

Dans `auth.mutations.ts`, `organization.mutations.ts` et `user.mutations.ts`, envelopper chaque mutation par `toActionResult`.

**Attention à la signature publique.** Le type de retour change : `Promise<T>` devient `Promise<ActionResult<T>>`. Les appelants doivent être adaptés — ils sont peu nombreux et tous dans `routes/`, plus `dashboard-sidebar.tsx`. Adaptez-les : c'est le prix du contrat, et ces fichiers sont réécrits aux tâches 3 à 5 de toute façon.

Lancez `check-types` : il énumère exactement les appelants à traiter.

- [ ] **Étape 6 : vérifier**

```bash
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
```

Attendu : `check-types` en code 0, au moins `655 passed | 12 skipped`.

- [ ] **Étape 7 : commit**

```bash
git add -A apps/web
git commit -m "feat(web): fixer le contrat d'erreur des Server Actions

createServerFn propageait le message d'une Error jusqu'au client ; une
Server Action de Next le remplace en production par un texte générique.
Les 26 messages français destinés au praticien deviendraient illisibles,
et le défaut ne se verrait qu'en production — Next ne censure pas en
développement.

toActionResult capture le message côté serveur et le renvoie comme
donnée. Il laisse passer les erreurs à digest NEXT_, sans quoi une
redirection deviendrait un message affiché.

Appliqué aux trois modules de mutations que les pages de ce lot
exercent. Les six autres suivront avec les pages qui les appellent.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LgueajX3wogo4r7ays5nCu"
```

---

### Tâche 2 : le shell racine

Remplace le `app/layout.tsx` provisoire du lot A par le vrai, et déplace le test du shell hors de `routes/`.

**Fichiers :**
- Créer : `apps/web/app/providers.tsx`
- Modifier : `apps/web/app/layout.tsx`
- Créer : `apps/web/app/layout.test.tsx` (reprend `routes/-__root.test.tsx`)

**Interfaces :**
- Consomme : `getContext` de `#/integrations/tanstack-query/root-provider` — **à ne pas réutiliser tel quel**, voir l'étape 1.
- Produit : `app/layout.tsx` avec ses `metadata`, et `app/providers.tsx` exportant `Providers`. Toutes les pages des tâches 3 à 6 en héritent.

- [ ] **Étape 1 : écrire les providers**

Créer `apps/web/app/providers.tsx` :

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AutumnProvider } from "autumn-js/react";
import { useState } from "react";

import { Toaster } from "@biume/ui/components/sonner";
import { TooltipProvider } from "@biume/ui/components/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  // Un QueryClient par montage, créé dans l'état plutôt qu'au niveau du
  // module. Un client de portée module serait partagé entre les requêtes du
  // serveur, donc entre praticiens : le cache de l'un servirait à l'autre.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AutumnProvider pathPrefix="/api/autumn" includeCredentials>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </AutumnProvider>
    </QueryClientProvider>
  );
}
```

`integrations/tanstack-query/root-provider.tsx` n'est plus utilisé par `app/`. Ne le supprimez pas : `routes/` s'en sert encore jusqu'au lot E.

**Les devtools de TanStack Router disparaissent** — il n'y a plus de routeur. Celles de Query peuvent revenir plus tard ; ne les remettez pas ici, ce lot ne les réclame pas.

- [ ] **Étape 2 : compléter `app/layout.tsx`**

Reprendre les `metadata` déjà en place au lot A (titre, description, `robots: { index: false, follow: false }`), envelopper `children` par `Providers`, et garder l'import de `../styles.css`.

- [ ] **Étape 3 : déplacer le test du shell**

`routes/-__root.test.tsx` vérifie les balises de tête du document. Portez-le en `app/layout.test.tsx`, contre les `metadata` de Next plutôt que contre le `head()` de TanStack.

**Le `noindex` est la seule assertion à ne pas perdre** : l'application ne doit jamais apparaître dans un résultat de recherche, toute l'acquisition passant par `biume.com`. Gardez une assertion qui échoue si `robots` disparaît.

Supprimez `routes/-__root.test.tsx` : son sujet a déménagé.

- [ ] **Étape 4 : vérifier**

```bash
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
bun --filter @biume/web dev &
sleep 15
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/
kill %1
```

Attendu : `check-types` en code 0, au moins `655 passed | 12 skipped` (le test du shell déménage, il ne disparaît pas), et `200` sur `/`.

- [ ] **Étape 5 : commit**

```bash
git add -A apps/web
git commit -m "feat(web): monter le shell racine et ses providers

Le QueryClient est créé dans l'état du composant, pas au niveau du
module : un client de portée module serait partagé entre les requêtes
du serveur, donc entre praticiens.

Les devtools de TanStack Router disparaissent avec le routeur. Le test
du shell quitte routes/ pour app/, en gardant l'assertion qui compte —
l'application ne doit jamais être indexée.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LgueajX3wogo4r7ays5nCu"
```

---

### Tâche 3 : les pages d'authentification et la racine

Cinq pages, les plus simples du lot : elles n'ont pas de garde et parlent à better-auth côté client.

**Fichiers :**
- Modifier : `apps/web/app/page.tsx` (remplace le provisoire du lot A)
- Créer : `apps/web/app/(auth)/signin/page.tsx`, `signup/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`

**Interfaces :**
- Consomme : `Providers` (tâche 2), les composants de `components/auth/`.
- Produit : les URL `/`, `/signin`, `/signup`, `/forgot-password`, `/reset-password`.

Les quatre pages portaient `ssr: false` sous TanStack. Elles deviennent des composants `"use client"`. **Le route group `(auth)` ne produit aucun segment d'URL** : `/signin` reste `/signin`.

- [ ] **Étape 1 : porter `app/page.tsx`**

`routes/index.tsx` fait sept lignes : une redirection inconditionnelle vers `/signin`.

```tsx
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/signin");
}
```

**`redirect()` de `next/navigation` lève** — c'est ainsi qu'il fonctionne. Ne l'entourez pas d'un `try/catch`.

- [ ] **Étape 2 : porter les quatre pages d'authentification**

Pour chacune, reprendre le corps du composant de la route TanStack, ajouter `"use client"` en tête, et porter les `head()` en `export const metadata`.

**Trois points de vigilance :**

- `reset-password` lit un paramètre de recherche (`validateSearch` sous TanStack). En composant client, utilisez `useSearchParams()`. Une page qui l'appelle doit être enveloppée d'un `<Suspense>` — Next l'exige, et le build échoue sinon avec un message explicite.
- `useNavigate()` de TanStack devient `useRouter()` de `next/navigation`. `navigate({ to: "/x" })` devient `router.push("/x")`.
- `<Link to="/x">` de TanStack devient `<Link href="/x">` de `next/link`.

- [ ] **Étape 3 : vérifier au clic**

```bash
bun --filter @biume/web dev &
sleep 15
for p in / /signin /signup /forgot-password /reset-password; do
  printf "%-20s %s\n" "$p" "$(curl -s -o /dev/null -w "%{http_code}" -L "http://localhost:3001$p")"
done
kill %1
```

Attendu : `200` partout (`/` après redirection).

Puis, **au navigateur** : connectez-vous réellement avec un compte de développement. C'est la première fois du chantier qu'un parcours utilisateur est vérifiable ; ne vous contentez pas des codes HTTP.

- [ ] **Étape 4 : vérifier et commiter**

```bash
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
git add -A apps/web
git commit -m "feat(web): porter les pages d'authentification vers l'App Router

Les quatre pages portaient ssr: false sous TanStack : elles deviennent
des composants client. Le route group (auth) ne produit aucun segment,
les URL sont inchangées.

reset-password lit ses paramètres par useSearchParams, ce qui impose un
Suspense — Next fait échouer le build sans lui.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LgueajX3wogo4r7ays5nCu"
```

---

### Tâche 4 : choix et création d'entreprise

Deux pages qui ont une garde et consomment le contexte de route. Elles sont l'étape entre la connexion et le tableau de bord.

**Fichiers :**
- Créer : `apps/web/app/select-organization/page.tsx`
- Créer : `apps/web/app/create-organization/page.tsx`

**Interfaces :**
- Consomme : `getSession`, `getOrganizations` de `#/functions/auth.function` (**import direct, règle 1**) ; `switchActiveOrganization` et `startOrganizationTrialFn` sous leur nouveau contrat `ActionResult` (tâche 1).
- Produit : les URL `/select-organization` et `/create-organization`.

**Le motif de ce lot, établi ici :** la page est un Server Component qui fait la garde et lit la donnée, puis rend un composant client auquel il passe cette donnée en props.

```
app/select-organization/page.tsx        RSC : garde + lecture
  └─ components/…/select-organization-view.tsx   "use client" : interaction
```

`routes/select-organization.tsx:95` fait `Route.useRouteContext()` pour obtenir `session` et `organizations`. En RSC, la page les lit directement — et `cache()` fait que la session n'est lue qu'une fois, même si la fonction est appelée plusieurs fois dans le rendu.

- [ ] **Étape 1 : porter `select-organization`**

Le `beforeLoad` de la route devient le corps du Server Component : lire la session, rediriger vers `/signin` si absente, lire les organisations, et rendre la vue.

Le corps interactif actuel (335 lignes) part dans un composant client sous `components/`. **N'en modifiez pas le rendu** : extraire, pas réécrire.

- [ ] **Étape 2 : porter `create-organization`**

Même découpage. Cette page appelle `startOrganizationTrialFn`, dont le contrat a changé à la tâche 1 : traitez le `{ success, error }` plutôt que d'attendre une valeur nue.

Le commentaire de `routes/create-organization.tsx:178` dit que l'échec de l'essai ne doit pas empêcher l'accès à l'entreprise créée. **Ce comportement de repli doit survivre au portage** — c'est une décision produit, pas un détail technique.

- [ ] **Étape 3 : vérifier au navigateur**

Parcours complet : connexion → choix d'entreprise → tableau de bord (qui rendra encore un 404 avant la tâche 5, c'est attendu). Puis création d'une entreprise.

```bash
bun --filter @biume/web dev &
sleep 15
curl -s -o /dev/null -w "sans session: %{http_code}\n" -L http://localhost:3001/select-organization
kill %1
```

Attendu : redirection vers `/signin`, donc `200` après suivi.

- [ ] **Étape 4 : vérifier et commiter**

```bash
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
git add -A apps/web
git commit -m "feat(web): porter le choix et la création d'entreprise

Établit le motif du lot : la page est un Server Component qui fait la
garde et lit la donnée, puis rend un composant client auquel il passe
cette donnée en props. Le contexte de route de TanStack disparaît sans
remplacement — cache() fait que la session n'est lue qu'une fois.

Le repli de l'essai gratuit est préservé : son échec ne doit pas
empêcher l'accès à l'entreprise fraîchement créée.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LgueajX3wogo4r7ays5nCu"
```

---

### Tâche 5 : le layout dashboard

**Le cœur du lot.** Ce layout garde tout l'espace authentifié : sans lui, une URL de dashboard est accessible sans session.

**Fichiers :**
- Créer : `apps/web/lib/dashboard-guards.ts` et `dashboard-guards.test.ts`
- Créer : `apps/web/app/dashboard/layout.tsx`
- Supprimer : `apps/web/routes/dashboard.test.ts`

**Interfaces :**
- Consomme : `getDashboardShellFn` de `#/lib/api/actions/dashboard-shell.action` (lecture serveur, import direct) ; les composants `components/dashboard/layout/`.
- Produit : `getDashboardRedirectTarget` et `resolveDashboardBillingRedirect` dans `lib/dashboard-guards.ts`, plus le layout dont héritent toutes les pages de la tâche 6 et des lots suivants.

- [ ] **Étape 1 : déplacer les fonctions pures et leur test**

`routes/dashboard.tsx` exporte deux fonctions pures que `routes/dashboard.test.ts` couvre : `getDashboardRedirectTarget` et `resolveDashboardBillingRedirect`. Déplacez-les vers `lib/dashboard-guards.ts`, **corps inchangé**, et portez le test en `lib/dashboard-guards.test.ts`.

Supprimez ensuite `routes/dashboard.test.ts`.

**Ce déplacement débloque une dette du lot B.** `server-only` n'a pas pu être posée sur `auth.function.ts`, `dashboard-shell.action.ts` et `subscription-gate.action.ts` parce que `routes/dashboard.test.ts` importait le vrai `routes/dashboard.tsx`, qui importe ces trois fichiers en chaîne — et `server-only` lève sous Vitest. Le test disparu, la chaîne aussi.

- [ ] **Étape 2 : reposer `import "server-only"` sur les trois fichiers**

`apps/web/functions/auth.function.ts`, `lib/api/actions/dashboard-shell.action.ts`, `lib/api/actions/subscription-gate.action.ts`.

Lancez la suite complète. Si un autre test casse, **retirez la directive du fichier fautif, notez lequel et pourquoi, et continuez** — ne vous battez pas avec.

- [ ] **Étape 3 : écrire le layout**

Le `beforeLoad` de `routes/dashboard.tsx:47-90` devient le corps du Server Component, dans le même ordre :

```tsx
import { redirect } from "next/navigation";

import { getDashboardShellFn } from "#/lib/api/actions/dashboard-shell.action";
import {
  getDashboardRedirectTarget,
  resolveDashboardBillingRedirect,
} from "#/lib/dashboard-guards";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // `preload` n'a plus d'équivalent : TanStack l'activait au survol d'un lien,
  // un layout Next s'exécute sur une navigation réelle.
  const shell = await getDashboardShellFn({ pathname: "", preload: false });

  const redirectTarget = getDashboardRedirectTarget(shell.session, {
    id: shell.currentOrganizationId,
  });

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  /* … garde de facturation, puis le shell … */
}
```

**Le problème du `pathname`, et sa solution.** Les deux gardes en dépendent, et pas décorativement : `getBillingGateRedirectTarget` renvoie `/dashboard/settings` **sauf** si le chemin courant est déjà celui-là. Or **un layout Next ne connaît pas le chemin courant** — il n'est pas re-rendu par segment et ne reçoit aucune information de route.

Sans pathname, la garde redirige vers `/dashboard/settings`, le layout s'exécute de nouveau sur cette page, ignore toujours où il est, et redirige encore : **boucle de redirection infinie**, le pire résultat possible de ce lot.

La solution est un middleware qui pose le chemin dans un en-tête que le layout lit. C'est le motif documenté de Next pour exactement ce besoin.

Créer `apps/web/middleware.ts` :

```ts
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next ne donne pas le chemin courant à un layout : il n'est pas re-rendu par
 * segment et ne reçoit rien de la route. Or la garde de facturation en dépend
 * — elle redirige vers `/dashboard/settings` sauf si on y est déjà, et sans
 * cette exception la redirection boucle indéfiniment.
 *
 * Le middleware, lui, connaît le chemin nativement. Il se contente de le
 * recopier dans un en-tête : aucun accès base, aucune session lue, donc
 * aucune raison de le faire grossir.
 */
export const PATHNAME_HEADER = "x-biume-pathname";

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(PATHNAME_HEADER, request.nextUrl.pathname);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: "/dashboard/:path*",
};
```

Le `matcher` limite l'exécution aux URL qui en ont besoin. **Ne l'élargissez pas** : un middleware qui s'exécute sur tout ajoute une latence à chaque requête, y compris aux fichiers statiques et aux 20 routes d'API.

Le layout lit alors :

```ts
const pathname = (await headers()).get(PATHNAME_HEADER) ?? "";
```

**Vérifiez que l'en-tête arrive réellement** avant d'écrire la suite : rendez-le temporairement dans la page, ou journalisez-le, et confirmez sa valeur sur `/dashboard` puis sur `/dashboard/settings`. Si l'en-tête est absent, **arrêtez-vous et remontez-le-moi** : le repli serait de déplacer la garde de facturation dans chaque page, qui connaît son chemin à l'écriture — plus verbeux, et surtout oubliable par la page suivante, ce qui désactiverait le paywall en silence.

**Et testez la boucle.** Ajoutez au test des gardes un cas qui vérifie que `resolveDashboardBillingRedirect("/dashboard/settings", false)` rend bien `null`. C'est la seule assertion qui protège de la boucle.

- [ ] **Étape 4 : monter le shell**

`DashboardSidebar`, `DashboardHeader`, `DashboardPageBanner` et `SidebarProvider` sont des composants existants. **Ne les modifiez pas** ; câblez-les.

`sidebarDefaultOpen` vient de `shell.sidebarDefaultOpen`, que `getDashboardShellFn` lit déjà dans le cookie. `routes/dashboard.tsx:104` lit aussi `useMatches()` pour la metadata `wideContent` d'une page ; ce mécanisme n'existe pas en Next — notez comment vous le remplacez.

- [ ] **Étape 5 : vérifier**

```bash
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
bun --filter @biume/web dev &
sleep 15
curl -s -o /dev/null -w "sans session: %{http_code}\n" -L http://localhost:3001/dashboard
kill %1
```

Attendu : redirection vers `/signin`. Puis **au navigateur, avec une session** : la sidebar, l'en-tête et la bannière doivent s'afficher comme avant. Comparez avec une capture de l'ancienne interface si vous en avez une.

- [ ] **Étape 6 : commit**

```bash
git add -A apps/web
git commit -m "feat(web): porter le layout dashboard et ses deux gardes

Le beforeLoad devient le corps d'un Server Component : un appel au shell,
deux fonctions pures de décision, et redirect() de next/navigation. Les
fonctions pures quittent routes/ pour lib/, avec leur test.

Ce déplacement débloque server-only sur auth.function.ts et les deux
actions de lecture : la chaîne d'import qui faisait lever la directive
sous Vitest passait par le test qui vient de disparaître.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LgueajX3wogo4r7ays5nCu"
```

---

### Tâche 6 : la page du tableau de bord

Dernière tâche : la page qui rend le lot visible, et le premier endroit du chantier où le motif hybride de la spec s'exerce en entier.

**Fichiers :**
- Créer : `apps/web/server/dashboard/overview.ts` et `overview.test.ts`
- Modifier : `apps/web/app/api/internal/dashboard/overview/route.ts`
- Créer : `apps/web/app/dashboard/page.tsx`, `loading.tsx`, `error.tsx`

**Interfaces :**
- Consomme : les fonctions de `#/functions/dashboard.function` et `dashboard-agenda.function` (imports directs) ; `DashboardOverviewView` et ses deux compagnons de rendu.
- Produit : `buildDashboardOverview(selectedDate)`, appelée par le handler **et** par la page.

- [ ] **Étape 1 : extraire la composition**

Créer `apps/web/server/dashboard/overview.ts`, portant la composition qui vit aujourd'hui dans `app/api/internal/dashboard/overview/route.ts` : les cinq lectures en parallèle, les fenêtres **90 / 90 / 30 / 5**, et la forme du résultat.

**Ces quatre fenêtres sont celles que le praticien voit.** Les changer modifierait silencieusement les chiffres affichés. Elles sont assertées nommément par le test du handler ; ajoutez la même assertion au test de la nouvelle fonction.

Puis réécrivez le handler pour qu'il appelle cette fonction, en gardant son mapping d'erreur.

- [ ] **Étape 2 : écrire la page**

```tsx
import { buildDashboardOverview } from "#/server/dashboard/overview";
import { getDashboardOverviewDate } from "#/lib/api/queries/dashboard.query";

export default async function DashboardPage() {
  const selectedDate = getDashboardOverviewDate();
  const overview = await buildDashboardOverview(selectedDate);

  /* … rendre DashboardOverviewView avec les mêmes props qu'aujourd'hui … */
}
```

`routes/dashboard/index.tsx:39-52` donne les props exactes à reproduire. **Ne changez pas la forme des props** : `DashboardOverviewView` et son test ne doivent pas bouger.

- [ ] **Étape 3 : porter les états d'attente et d'erreur**

`pendingComponent` devient `app/dashboard/loading.tsx`, `errorComponent` devient `app/dashboard/error.tsx`. Les composants `DashboardOverviewPending` et `DashboardOverviewError` existent déjà : câblez-les.

`error.tsx` de Next doit porter `"use client"` et accepter `{ error, reset }`.

- [ ] **Étape 4 : vérifier**

```bash
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
bun --filter @biume/web build 2>&1 | tail -25
```

Attendu : `check-types` en code 0, au moins `658 passed | 12 skipped`, et un build qui liste `/dashboard` en route dynamique.

Puis **au navigateur, avec une session** : le tableau de bord doit afficher les mêmes chiffres qu'avant la migration. `components/dashboard/overview/dashboard-overview-view.test.tsx` doit rester vert **sans avoir été modifié** — c'est lui qui prouve que la forme des props n'a pas bougé.

- [ ] **Étape 5 : commit**

```bash
git add -A apps/web
git commit -m "feat(web): servir le tableau de bord en Server Component

La composition des cinq lectures est extraite : le route handler et la
page l'appellent tous deux, au lieu de la recopier et de la faire
diverger. La page l'appelle directement, sans passer par le réseau.

C'est le premier endroit du chantier où cache() opère vraiment — il ne
mémoïse pas dans un route handler, il mémoïse dans un Server Component.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LgueajX3wogo4r7ays5nCu"
```

---

## Fin du lot C

État atteint :

- Un praticien se connecte, choisit son entreprise et voit son tableau de bord, servis par Next.
- Les gardes du dashboard sont des Server Components ; le contexte de route de TanStack a disparu sans remplacement.
- Les messages d'erreur des mutations survivent à la production.
- `server-only` protège les fichiers serveur que le lot B n'avait pas pu couvrir.
- Les deux derniers tests couplés à TanStack ont quitté `routes/`.

Ce que le lot C ne fait pas : les pages `agenda`, `clients`, `patients`, `reports`, `settings` et `assistant` rendent encore un 404. Elles arrivent au lot D.

**Suite :** le plan du lot D est écrit à la fin du lot C, contre l'état réel du code.
