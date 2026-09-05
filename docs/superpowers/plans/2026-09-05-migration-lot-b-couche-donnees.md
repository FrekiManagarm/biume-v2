# Migration `apps/web` vers Next.js — Lot B : contexte de requête et couche données

> **Pour les agents :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe case à cocher (`- [ ]`).

**Objectif :** retirer `createServerFn` des 59 fonctions serveur, remplacer le contexte de requête TanStack par celui de Next, et exposer les lectures consommées par le client à travers des route handlers — **sans changer une seule signature publique**, donc sans toucher aux 6 fichiers `queries/` ni aux 173 composants.

**Architecture :** la couche `lib/api/actions/*` est le point d'appui : ses signatures sont le contrat que le reste de l'application consomme. Elle se scinde en deux, parce qu'un même module ne peut pas servir à la fois un Server Component et un composant client — les lectures deviennent des enveloppes `fetch` vers des route handlers, les mutations deviennent des Server Actions, et le fichier `.action.ts` réexporte les deux pour que ses consommateurs ne voient aucun changement.

**Pile technique :** Next 16.2.9, React 19.2.7, Zod 4, Drizzle, TanStack Query (conservé), Vitest 4, Bun 1.3.11.

**Spec :** `docs/superpowers/specs/2026-09-05-migration-web-nextjs-design.md` (§ 5 et tranche 2 du § 10)

**Lot précédent :** `docs/superpowers/plans/2026-09-05-migration-lot-a-socle-et-api.md`, achevé aux commits `9f9fe778..52f2f9ab`.

## Contraintes globales

- **Aucune signature publique de `lib/api/actions/*` ne change.** C'est la contrainte qui tient le budget du chantier : si une signature bouge, les 6 fichiers `queries/` et les composants qui les consomment entrent dans le périmètre, et le lot explose. Une conversion qui semble exiger un changement de signature est un signal d'arrêt, pas une licence.
- **Aucun fichier sous `apps/web/components/` n'est modifié.**
- **Un seul fichier de `apps/web/lib/api/queries/` est modifié** : le `queryFn` de `dashboard.query.ts`, à la tâche 5, pour remplacer cinq appels réseau par un seul. Sa clé de requête, sa signature et la forme de son résultat restent identiques. Les cinq autres fichiers `queries/` ne sont pas touchés — si l'un d'eux refuse de compiler, c'est qu'une signature a bougé, ce qui est un signal d'arrêt.
- **Rien sous `apps/web/server/` n'est modifié**, à l'exception de `server/auth/organization-scope.ts` (tâche 1).
- **`/api/mobile/v1` et `/api/owner/v1` ne bougent pas.** `openapi-drift.test.ts` reste vert à chaque tâche.
- **Ligne de base de tests au départ du lot :** `627 passed | 12 skipped (639)`, `86 files passed | 2 skipped (88)`. **Ce compte ne doit jamais baisser.**
- **`check-types` en code 0 à la fin de chaque tâche.** C'est le point de contrôle principal du lot : la conversion casse les appelants dès qu'elle est partielle, et le compilateur est ce qui le dit.
- Le dossier `routes/` reste sur disque et doit continuer de compiler. Les dépendances TanStack restent installées jusqu'au lot E.
- **Bun uniquement.** `bun --filter @biume/web <script>` fonctionne pour `test`, `check-types`, `build`, `lint`. En revanche `bun add`/`bun remove` exigent `--cwd=apps/web` avec bun 1.3.11 — `--filter` n'y fonctionne pas.
- `bun --filter @biume/web lint` sort en code non nul (76 erreurs, 24 avertissements préexistantes sur du code jamais linté). Ce n'est pas un point de contrôle de ce lot ; ne pas corriger ces constats.

## Ce que ce lot ne vérifie pas, et pourquoi

Aucune page de l'application n'est servie avant le lot C. Ce lot **ne peut donc pas être vérifié au clic** : ses points de contrôle sont le compilateur, les 627 tests, et des appels `curl` directs sur les route handlers. C'est assumé. En contrepartie, tout casser ici est sans conséquence pour un utilisateur : il n'y a pas d'utilisateur sur cette branche.

## Le motif de conversion

Il est uniforme sur les 59 fonctions. Relevé : **aucune n'utilise `.middleware()`**, toutes n'emploient que `.validator()` et `.handler()`.

```ts
// AVANT
export const createClient = createServerFn({ method: "POST" })
  .validator(createClientSchema)
  .handler(async ({ data }) => {
    const organizationId = await requireOrganizationId();
    /* … corps inchangé … */
  });

// APRÈS
export async function createClient(input: CreateClientInput) {
  const data = createClientSchema.parse(input);
  const organizationId = await requireOrganizationId();
  /* … corps strictement inchangé … */
}
```

Trois règles qui ne souffrent pas d'exception :

1. **Le corps du `handler` est recopié tel quel.** Aucune reformulation, aucune « amélioration ». Ce lot déplace du code, il ne le réécrit pas.
2. **La validation reste.** `.validator(schema)` devient `schema.parse(input)` en première ligne. La supprimer ouvrirait un trou de sécurité : ces fonctions deviennent des Server Actions, donc des points d'entrée appelables depuis le réseau.
3. **Le type d'entrée est celui que le schéma infère.** Là où le fichier exporte déjà un type (`CreateClientInput`), on le réutilise ; sinon on l'ajoute avec `z.infer`.

Et la couche d'adaptation, qui perd sa seule raison d'être :

```ts
// AVANT — lib/api/actions/clients.action.ts
export function createClient(input: CreateClientInput) {
  return createClientFn({ data: input });   // déballait la convention TanStack
}
```

## Les tests qui inspectent le texte source

Quatre fichiers de test lisent le source des fonctions avec `readFileSync` et le découpent par `indexOf("export const <nom>")`, pour vérifier que les mutations portent bien leurs gardes d'isolation multi-tenant. **La conversion change ces ancres** : `export const createReport` devient `export async function createReport`.

| Fichier de test | Source inspecté | Ancres |
| --- | --- | --- |
| `functions/clients.function.test.ts` | `clients.function.ts` | 1 (traité à la tâche 2) |
| `functions/patients.function.test.ts` | `patients.function.ts` | 6 — tâche 3 |
| `functions/tenant-creation-wiring.test.ts` | `appointments.function.ts`, `reports.function.ts` | 11 — tâches 3 et 4 |
| `functions/reports-update-wiring.test.ts` | `reports.function.ts` | 2 — tâche 4 |

**Pourquoi c'est plus dangereux qu'il n'y paraît.** La plupart de ces ancres délimitent un *intervalle* — `source.slice(indexOf(début), indexOf(fin))`. Quand `indexOf` ne trouve pas son ancre, il rend `-1`, et `slice` interprète `-1` comme « un caractère avant la fin ». Le test continue alors de s'exécuter sur une tranche de source arbitraire, et ses assertions peuvent passer. Ce sont précisément les tests qui garantissent qu'une mutation ne peut pas toucher les données d'une autre entreprise : les laisser passer à vide reviendrait à retirer le filet sans que rien ne l'annonce.

**Ce qu'il faut faire :** mettre à jour chaque ancre, `export const <nom>` → `export async function <nom>`, **et rien d'autre**. Les assertions ne changent pas. C'est le seul cas du lot où toucher à un test préexistant est légitime : le test porte sur la syntaxe du fichier, et la syntaxe a changé pour une raison assumée.

**Ce qu'il ne faut pas faire :** ajuster une assertion parce qu'elle échoue. Une assertion qui tombe après la seule mise à jour des ancres signale que le corps d'un `handler` a été modifié pendant la recopie — reviens au corps d'origine.

Après la conversion de chacun de ces fichiers, vérifie qu'aucune ancre ne subsiste :

```bash
grep -rn 'indexOf("export const' apps/web --include="*.test.ts"
```

## Structure des fichiers

| Fichier | Responsabilité | Tâche |
| --- | --- | --- |
| `apps/web/server/auth/organization-scope.ts` | `cache()` + `headers()` au lieu de `WeakMap<Request>` | 1 |
| `apps/web/functions/sidebar.function.ts` | `headers()` de `next/headers` | 1 |
| `apps/web/functions/auth.function.ts` | idem, 5 occurrences | 1 |
| `apps/web/lib/api/actions/dashboard-shell.action.ts` | idem, 1 occurrence | 1 |
| `apps/web/lib/http/internal-fetch.ts` | **nouveau** — l'unique client des route handlers internes | 2 |
| `apps/web/functions/*.function.ts` (12) | `createServerFn` retiré, fonctions ordinaires | 2-6 |
| `apps/web/lib/api/actions/*.mutations.ts` (nouveaux) | `"use server"`, une par ressource ayant des mutations | 2-6 |
| `apps/web/lib/api/actions/*.action.ts` (14) | signatures inchangées ; lectures en `fetch`, mutations réexportées | 2-6 |
| `apps/web/app/api/internal/**/route.ts` (8) | lectures consommées par les `queries/` | 2-5 |

**Pourquoi `app/api/internal/`** : ces endpoints servent le client de cette application et changeront avec lui. Les nommer ainsi les distingue de `/api/mobile/v1` et `/api/owner/v1`, qui sont des contrats versionnés avec des consommateurs externes, et écarte toute collision future.

**Pourquoi trois fichiers par ressource plutôt qu'un** : une directive `"use server"` s'applique au fichier entier. Mettre les lectures et les mutations dans le même module transformerait les lectures en Server Actions — que Next sérialise côté client, une à la fois. La page dashboard tire aujourd'hui cinq lectures en parallèle ; les sérialiser la rendrait **plus lente qu'avant la migration**, ce qui retirerait au chantier une bonne part de sa raison d'être.

## Les huit route handlers de lecture

Relevé en deux temps. D'abord les 6 fichiers `queries/`, qui consomment **11 fonctions**. Puis — après que la tâche 3 a buté dessus — les composants eux-mêmes, qui appellent **cinq lectures de plus** directement dans un `useQuery`, sans passer par un fichier `queries/`. Mon premier relevé les avait manquées pour deux raisons cumulées : je n'avais inspecté que `lib/api/queries/`, et j'avais grepé l'alias `#/` en ignorant `@/`, qui pointe au même endroit.

**Treize handlers, donc, pas huit.** Une lecture appelée depuis un composant client ne peut pas être un simple réexport : la fonction importe `db`, et l'importer en valeur depuis un composant ferait entrer Drizzle dans le bundle client sans qu'aucun test ne le signale.

| Handler | Fonctions servies | Tâche |
| --- | --- | --- |
| `GET /api/internal/clients` | `getAllClients` | 2 |
| `GET /api/internal/patients` | `getAllPatients` | 3 |
| `GET /api/internal/animals` | `getAllAnimals` | 3 |
| `GET /api/internal/appointments` | `getAppointments` | 3 |
| `GET /api/internal/patients/[id]` | `getPatientById` — 3 composants | 3 |
| `GET /api/internal/patients/[id]/medical-documents` | `getMedicalDocumentsByPetId` — 1 composant | 3 |
| `GET /api/internal/patients/[id]/appointments` | `getAppointmentsByPatientId` — 1 composant | 3 |
| `GET /api/internal/reports` | `getAllReports` | 4 |
| `GET /api/internal/reports/[id]` | `getReportById` | 4 |
| `GET /api/internal/anatomical-parts` | `getAnatomicalParts` — 3 composants | 4 |
| `GET /api/internal/patients/[id]/anatomical-history` | `getPatientAnatomicalHistory` — 2 composants | 4 |
| `GET /api/internal/dashboard/agenda` | `getDashboardAgendaDay` | 5 |
| `GET /api/internal/dashboard/overview` | `getNewClientsMetric`, `getNewPatientsMetric`, `getSentReportsMetric`, `getRecentActivity`, `getDashboardAgendaDay` | 5 |

**Le dernier est le gain de perf le plus visible du lot.** `dashboardOverviewQueryOptions` lance aujourd'hui ces cinq appels **en parallèle depuis le navigateur**, soit cinq allers-retours réseau pour peindre le tableau de bord. Le handler les compose côté serveur : un seul aller-retour, et la composition se fait à côté de la base plutôt qu'à l'autre bout du réseau.

---

### Tâche 1 : le contexte de requête

Fondation du lot : tout le reste appelle `requireOrganizationId`. Petite, isolée, et elle a ses propres tests.

**Fichiers :**
- Modifier : `apps/web/server/auth/organization-scope.ts`
- Modifier : `apps/web/functions/sidebar.function.ts:7`
- Modifier : `apps/web/functions/auth.function.ts` (5 occurrences)
- Modifier : `apps/web/lib/api/actions/dashboard-shell.action.ts:2,79`
- Créer : `apps/web/server/auth/organization-scope.test.ts`

**Interfaces :**
- Consomme : `auth.api.getSession` de `@biume/auth`, `headers()` de `next/headers`.
- Produit : `requireOrganizationId(): Promise<string>`, **signature inchangée**. Toutes les tâches suivantes l'appellent sans savoir qu'elle a changé de mécanique.

- [ ] **Étape 1 : écrire le test qui échoue**

**Ce que ce test ne peut pas couvrir, et pourquoi.** La raison d'être de ce fichier est la mémoïsation par requête : sans elle, la page Animaux relit la session douze fois (le commentaire du fichier documente le coût mesuré, ~170 ms contre ~50 ms). Or `cache()` de React **ne mémoïse pas hors d'un contexte de requête React**, et Vitest n'en fournit pas — vérifié empiriquement avant l'écriture de ce plan : trois appels à une fonction `cache()`-ée y produisent trois exécutions, pas une.

La mémoïsation est donc le contrat de React, garanti par les tests de React, et **non couverte par nos tests**. Ne cherche pas à l'assertion : tu écrirais un test qui échoue pour une raison étrangère à ton code. Le garde-fou est ailleurs — le commentaire du fichier, à l'étape 3, dit explicitement pourquoi `cache()` ne doit pas être retiré.

Le test couvre ce qui est testable : la résolution, et le rejet.

Créer `apps/web/server/auth/organization-scope.test.ts` :

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();

vi.mock("@biume/auth", () => ({ auth: { api: { get getSession() { return getSession; } } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ cookie: "session=x" }) }));

describe("requireOrganizationId", () => {
  beforeEach(() => {
    vi.resetModules();
    getSession.mockReset();
  });

  it("rend l'organisation active portée par la session", async () => {
    getSession.mockResolvedValue({ session: { activeOrganizationId: "org_1" } });
    const { requireOrganizationId } = await import("./organization-scope");

    await expect(requireOrganizationId()).resolves.toBe("org_1");
  });

  it("transmet les en-têtes de la requête à la lecture de session", async () => {
    getSession.mockResolvedValue({ session: { activeOrganizationId: "org_1" } });
    const { requireOrganizationId } = await import("./organization-scope");

    await requireOrganizationId();

    // Sans les en-têtes, better-auth ne voit pas le cookie et toute lecture
    // deviendrait anonyme : chaque appelant recevrait un rejet plutôt que
    // ses données.
    const [call] = getSession.mock.calls;
    expect(call[0].headers.get("cookie")).toBe("session=x");
  });

  it("lève quand la session ne porte pas d'organisation active", async () => {
    getSession.mockResolvedValue({ session: { activeOrganizationId: null } });
    const { requireOrganizationId } = await import("./organization-scope");

    await expect(requireOrganizationId()).rejects.toThrow("Organization not found");
  });

  it("lève quand il n'y a pas de session du tout", async () => {
    getSession.mockResolvedValue(null);
    const { requireOrganizationId } = await import("./organization-scope");

    await expect(requireOrganizationId()).rejects.toThrow("Organization not found");
  });
});
```

- [ ] **Étape 2 : lancer le test et vérifier qu'il échoue**

```bash
cd /Users/mathieuchambaud/Documents/Perso-Projects/biume-v2
bun --filter @biume/web test server/auth
```

Attendu : ÉCHEC. Le fichier actuel importe `getRequest` de `@tanstack/react-start/server`, qui n'a pas de requête à fournir sous Vitest.

- [ ] **Étape 3 : réécrire `organization-scope.ts`**

Remplacer le contenu du fichier par :

```ts
import { cache } from "react";

import { auth } from "@biume/auth";
import { headers } from "next/headers";

/**
 * Une résolution d'organisation par requête HTTP, et une seule.
 *
 * Chaque fonction serveur de données appelait `getCurrentOrganization()`,
 * c'est-à-dire `auth.api.getFullOrganization()` : mesuré sur la base de dev,
 * ~170 ms par appel (session, organisation, membres, invitations) contre
 * ~50 ms pour la session seule. Or ces fonctions n'ont besoin que de
 * l'identifiant, que la session porte déjà dans `activeOrganizationId`.
 *
 * Le rendu d'une page exécute plusieurs de ces fonctions dans la même
 * requête — douze sur la page Animaux. `cache()` de React ramène ça à une
 * seule lecture de session, et couvre en plus les Server Actions de la même
 * requête, ce que la `WeakMap<Request>` précédente ne savait pas faire.
 *
 * NE PAS retirer `cache()` en le croyant décoratif : aucun test ne protège
 * cette mémoïsation. Elle n'opère que dans un contexte de requête React, que
 * Vitest ne fournit pas — une fonction `cache()`-ée y est appelée autant de
 * fois qu'on l'invoque. La suite resterait donc verte en perdant douze fois
 * la performance de la page Animaux.
 */
export const requireOrganizationId = cache(async (): Promise<string> => {
  const session = await auth.api.getSession({ headers: await headers() });
  const organizationId = session?.session.activeOrganizationId;

  if (!organizationId) {
    throw new Error("Organization not found");
  }

  return organizationId;
});
```

Note : `cache()` ne mémoïse pas les rejets au-delà de la requête courante, ce que l'ancien code obtenait par un `catch` explicite qui retirait l'entrée de la `WeakMap`. Le comportement voulu est conservé sans code dédié.

- [ ] **Étape 4 : lancer le test et vérifier qu'il passe**

```bash
bun --filter @biume/web test server/auth
```

Attendu : `4 passed`.

- [ ] **Étape 5 : convertir les trois autres consommateurs du contexte**

`getRequestHeaders()` de TanStack devient `await headers()` de Next. Attention : `headers()` est **asynchrone** en Next 16, contrairement à `getRequestHeaders()`. Chaque site d'appel doit être `await`é, et la fonction englobante doit être `async`.

- `apps/web/functions/sidebar.function.ts:7` — `const headers = getRequestHeaders();` → `const requestHeaders = await headers();` (renommer la variable locale : elle entrerait en collision avec la fonction importée).
- `apps/web/functions/auth.function.ts` — 5 occurrences, même transformation, même précaution de nommage.
- `apps/web/lib/api/actions/dashboard-shell.action.ts:79` — `getRequestHeaders().get("cookie")` → `(await headers()).get("cookie")`.

Dans les trois fichiers, remplacer l'import `import { getRequestHeaders } from "@tanstack/react-start/server";` par `import { headers } from "next/headers";`.

- [ ] **Étape 6 : vérifier**

```bash
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
grep -rn "@tanstack/react-start/server" apps/web --include="*.ts" --include="*.tsx"
```

Attendu : `check-types` en code 0, au moins `631 passed | 12 skipped`, et **aucun résultat** au `grep` : plus personne n'importe le contexte de requête de TanStack.

- [ ] **Étape 7 : commit**

```bash
git add -A apps/web
git commit -m "refactor(web): passer le contexte de requête à next/headers

requireOrganizationId troque sa WeakMap<Request> pour cache() de React :
même sémantique — une résolution de session par requête — et la
mémoïsation couvre en plus les Server Actions de la même requête, ce que
la WeakMap ne savait pas faire.

Le test garde ce que rien d'autre ne garde : que la mémoïsation existe.
Sans elle la page Animaux relit la session douze fois, et aucun autre
test ne le verrait.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LgueajX3wogo4r7ays5nCu"
```

---

### Tâche 2 : la tranche verticale « clients »

Cette tâche établit le motif complet sur **une seule ressource**, de bout en bout. Les tâches 3 à 6 le répètent. Elle est donc à relire en profondeur : ce qui est validé ici sera copié cinq fois.

`clients` est choisie parce qu'elle est la plus petite ressource complète : une lecture, trois mutations.

**Fichiers :**
- Créer : `apps/web/lib/http/internal-fetch.ts`
- Créer : `apps/web/app/api/internal/clients/route.ts` et `route.test.ts`
- Créer : `apps/web/lib/api/actions/clients.mutations.ts`
- Modifier : `apps/web/functions/clients.function.ts`
- Modifier : `apps/web/lib/api/actions/clients.action.ts`

**Interfaces :**
- Consomme : `requireOrganizationId` (tâche 1) ; `createClientSchema`, `updateClientSchema`, `deleteClientSchema` de `#/functions/clients.schema` (inchangés).
- Produit, et les tâches suivantes s'en servent :
  - `internalGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T>` — dans `lib/http/internal-fetch.ts`
  - le motif à trois fichiers par ressource : `*.function.ts` (pur), `*.mutations.ts` (`"use server"`), `*.action.ts` (contrat public, réexporte)
- **Signatures publiques inchangées** : `getAllClients(params?)`, `createClient(input)`, `updateClient(input)`, `deleteClient(input)`.

- [ ] **Étape 1 : écrire le test qui échoue**

Créer `apps/web/app/api/internal/clients/route.test.ts` :

```ts
import { describe, expect, it, vi } from "vitest";

const getAllClients = vi.fn();

vi.mock("#/functions/clients.function", () => ({
  get getAllClients() { return getAllClients; },
}));

describe("GET /api/internal/clients", () => {
  it("transmet les paramètres d'URL typés à getAllClients", async () => {
    getAllClients.mockReset();
    getAllClients.mockResolvedValue([{ id: "c1" }]);
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/internal/clients?search=du&page=2&limit=50"),
    );

    // Les paramètres arrivent en chaînes dans l'URL ; le handler doit les
    // rendre au type que la fonction attend, sinon `page` vaut "2" et la
    // pagination casse en silence.
    expect(getAllClients).toHaveBeenCalledWith({ search: "du", page: 2, limit: 50 });
    await expect(response.json()).resolves.toEqual([{ id: "c1" }]);
  });

  it("appelle getAllClients sans paramètre quand l'URL n'en porte pas", async () => {
    getAllClients.mockReset();
    getAllClients.mockResolvedValue([]);
    const { GET } = await import("./route");

    await GET(new Request("http://localhost:3001/api/internal/clients"));

    expect(getAllClients).toHaveBeenCalledWith({});
  });

  it("répond 401 quand l'organisation n'est pas résolue", async () => {
    getAllClients.mockReset();
    getAllClients.mockRejectedValue(new Error("Organization not found"));
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost:3001/api/internal/clients"));

    expect(response.status).toBe(401);
  });
});
```

- [ ] **Étape 2 : lancer le test et vérifier qu'il échoue**

```bash
bun --filter @biume/web test app/api/internal
```

Attendu : ÉCHEC, `Failed to load url ./route`.

- [ ] **Étape 3 : convertir `functions/clients.function.ts`**

Retirer l'import `createServerFn`. Convertir les quatre fonctions selon le motif de l'en-tête de ce plan. Le corps de chaque `handler` est recopié **sans une modification**.

```ts
export async function getAllClients(input: GetAllClientsParams = {}) {
  const data = getAllClientsParams.parse(input);
  /* … corps actuel, inchangé … */
}

export async function createClient(input: CreateClientInput) {
  const data = createClientSchema.parse(input);
  /* … corps actuel, inchangé … */
}

export async function updateClient(input: UpdateClientInput) {
  const data = updateClientSchema.parse(input);
  /* … corps actuel, inchangé … */
}

export async function deleteClient(input: DeleteClientInput) {
  const data = deleteClientSchema.parse(input);
  /* … corps actuel, inchangé … */
}
```

Les réexports de schémas et de types en tête de fichier restent tels quels.

- [ ] **Étape 4 : écrire le client HTTP interne**

Créer `apps/web/lib/http/internal-fetch.ts`. Un seul fichier pour les huit handlers : sans lui, chaque enveloppe de lecture réinventerait la gestion d'erreur, et une seule oublierait de vérifier `response.ok`.

```ts
/**
 * Client des route handlers de `app/api/internal/*`.
 *
 * Ces endpoints servent le cache client de cette application et n'ont pas de
 * consommateur externe, contrairement à `/api/mobile/v1` et `/api/owner/v1`.
 *
 * `credentials: "include"` est indispensable : la session vit dans un cookie
 * et le handler résout l'organisation à partir de lui. Sans ce réglage, toute
 * lecture répondrait 401.
 */
export async function internalGet<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  const response = await fetch(`${path}${query ? `?${query}` : ""}`, {
    credentials: "include",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    // Le message porte le chemin : une erreur de lecture remonte jusqu'à un
    // toast dans l'interface, et « 500 » seul n'aide personne à diagnostiquer.
    throw new Error(`Lecture ${path} : ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
```

- [ ] **Étape 5 : écrire le route handler**

Créer `apps/web/app/api/internal/clients/route.ts` :

```ts
import { getAllClients } from "#/functions/clients.function";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const search = params.get("search");
  const page = params.get("page");
  const limit = params.get("limit");

  try {
    return Response.json(
      await getAllClients({
        ...(search !== null && { search }),
        ...(page !== null && { page: Number(page) }),
        ...(limit !== null && { limit: Number(limit) }),
      }),
    );
  } catch (error) {
    // `requireOrganizationId` lève quand la session n'a pas d'organisation
    // active. C'est un défaut d'autorisation, pas une panne : le client doit
    // pouvoir le distinguer d'un 500 pour rediriger plutôt que réessayer.
    if (error instanceof Error && error.message === "Organization not found") {
      return Response.json({ error: "Organization not found" }, { status: 401 });
    }

    throw error;
  }
}
```

- [ ] **Étape 6 : écrire les mutations en Server Actions**

Créer `apps/web/lib/api/actions/clients.mutations.ts` :

```ts
"use server";

import {
  createClient as createClientFn,
  deleteClient as deleteClientFn,
  updateClient as updateClientFn,
  type CreateClientInput,
  type DeleteClientInput,
  type UpdateClientInput,
} from "#/functions/clients.function";

export async function createClient(input: CreateClientInput) {
  return createClientFn(input);
}

export async function updateClient(input: UpdateClientInput) {
  return updateClientFn(input);
}

export async function deleteClient(input: DeleteClientInput) {
  return deleteClientFn(input);
}
```

Pas de `revalidatePath` ici : aucune page RSC n'existe encore. Le lot C l'ajoutera quand il y aura quelque chose à revalider. L'invalidation reste pour l'instant celle de TanStack Query, côté client, qui fonctionne déjà.

- [ ] **Étape 7 : réécrire la couche d'adaptation**

Remplacer le contenu de `apps/web/lib/api/actions/clients.action.ts` par :

```ts
import { internalGet } from "#/lib/http/internal-fetch";
import type { Client } from "@biume/db/schema/index";
import type { GetAllClientsParams } from "#/functions/clients.function";

export type {
  CreateClientInput,
  DeleteClientInput,
  GetAllClientsParams,
  UpdateClientInput,
} from "#/functions/clients.function";

// Les mutations sont des Server Actions ; les réexporter d'ici garde le
// contrat que les composants consomment déjà.
export { createClient, updateClient, deleteClient } from "./clients.mutations";

type ClientWithRelations = Awaited<
  ReturnType<typeof import("#/functions/clients.function").getAllClients>
>[number];

export function getAllClients(params: GetAllClientsParams = {}) {
  return internalGet<ClientWithRelations[]>("/api/internal/clients", params);
}
```

**Vérifie que la signature de `getAllClients` est identique à l'ancienne**, y compris le type de retour. `lib/api/queries/clients.query.ts` ne doit pas être modifié — s'il refuse de compiler, c'est que la signature a bougé et il faut corriger l'enveloppe, pas la requête.

Si `ClientWithRelations` se révèle impraticable, définis le type explicitement dans `clients.function.ts` et exporte-le — mais **ne change pas la forme des données renvoyées**.

- [ ] **Étape 8 : lancer les tests et vérifier qu'ils passent**

```bash
bun --filter @biume/web test app/api/internal
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
```

Attendu : `3 passed` sur le handler, `check-types` en code 0, et au moins `634 passed | 12 skipped`.

Si `check-types` signale une erreur dans `lib/api/queries/clients.query.ts` ou dans un composant, **arrête-toi** : la signature a changé, ce que les contraintes globales interdisent.

- [ ] **Étape 9 : vérifier le handler en conditions réelles**

```bash
bun --filter @biume/web dev &
sleep 15
curl -s -o /dev/null -w "sans session: %{http_code}\n" "http://localhost:3001/api/internal/clients?search=a"
kill %1
```

Attendu : `401`. Un `404` signifierait que le handler n'est pas monté ; un `500` que l'erreur d'autorisation n'est pas distinguée.

- [ ] **Étape 10 : commit**

```bash
git add -A apps/web
git commit -m "refactor(web): convertir la ressource clients hors de createServerFn

Établit le motif que les ressources suivantes reprendront : la fonction
devient une fonction async ordinaire qui valide son entrée, les mutations
deviennent des Server Actions, et la lecture passe par un route handler
interne que le fichier .action.ts enveloppe.

Les trois fichiers sont séparés parce qu'une directive \"use server\"
s'applique au fichier entier : mêler lectures et mutations ferait
sérialiser les lectures par Next, une à la fois, et rendrait le tableau
de bord plus lent qu'avant la migration.

La signature publique de lib/api/actions/clients.action.ts ne bouge pas,
donc ni les queries ni les composants ne sont touchés.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LgueajX3wogo4r7ays5nCu"
```

---

### Tâche 3 : patients, rendez-vous et documents médicaux

Le motif de la tâche 2, appliqué à trois ressources. Traitement par lot : les trois suivent la même transformation, et les découper en trois tâches ne donnerait rien de plus à relire.

**Fichiers :**
- Modifier : `apps/web/functions/patients.function.ts` (6 fonctions : `getAllPatients` GET, `getAllAnimals` GET, `getPatientById` GET, `createPatient` POST, `updatePatient` POST, `deletePatient` POST)
- Modifier : `apps/web/functions/appointments.function.ts` (8 fonctions : `getAppointments` GET, `checkAppointmentConflicts` GET, `getTodayAppointments` GET, `getAppointmentsWithoutReport` GET, `getAppointmentsByPatientId` GET, `createAppointment` POST, `updateAppointment` POST, `deleteAppointment` POST)
- Modifier : `apps/web/functions/medical-documents.function.ts` (4 fonctions : `getMedicalDocumentsByPetId` GET, `createMedicalDocument` POST, `deleteMedicalDocument` POST, `updateMedicalDocument` POST)
- Créer : `apps/web/lib/api/actions/patients.mutations.ts`, `appointments.mutations.ts`, `medicalDocuments.mutations.ts`
- Modifier : `apps/web/lib/api/actions/patients.action.ts`, `appointments.action.ts`, `medicalDocuments.action.ts`
- Créer : `apps/web/app/api/internal/patients/route.ts`, `animals/route.ts`, `appointments/route.ts`
- Créer : `apps/web/app/api/internal/appointments/route.test.ts`

**Interfaces :**
- Consomme : `internalGet` de `#/lib/http/internal-fetch` et le motif à trois fichiers, tous deux produits par la tâche 2.
- Produit : signatures publiques inchangées pour `getAllPatients`, `getPatientById`, `getAllAnimals`, `createPatient`, `updatePatient`, `deletePatient`, `getAppointments`, `getAppointmentsByPatientId`, `getAppointmentsWithoutReport`, `getTodayAppointments`, `createAppointment`, `updateAppointment`, `deleteAppointment`, `getMedicalDocumentsByPetId`, `createMedicalDocument`, `updateMedicalDocument`, `deleteMedicalDocument`.

**Six lectures ont besoin d'un handler**, pas trois comme l'annonçait la première version de ce plan :

| Lecture | Pourquoi un handler | Handler |
| --- | --- | --- |
| `getAllPatients` | consommée par `patients.query.ts` | `/api/internal/patients` |
| `getAllAnimals` | consommée par `patients.query.ts` | `/api/internal/animals` |
| `getAppointments` | consommée par `appointments.query.ts` | `/api/internal/appointments` |
| `getPatientById` | appelée en `useQuery` par `animal-folder/index.tsx`, `reports-editor.tsx`, `InitializationDialog.tsx` | `/api/internal/patients/[id]` |
| `getMedicalDocumentsByPetId` | appelée en `useQuery` par `AnimalCredenza/MedicalFilesTab.tsx` | `/api/internal/patients/[id]/medical-documents` |
| `getAppointmentsByPatientId` | appelée en `useQuery` par `InitializationDialog.tsx` | `/api/internal/patients/[id]/appointments` |

Les trois restantes — `getTodayAppointments`, `getAppointmentsWithoutReport`, `checkAppointmentConflicts` — ne sont appelées ni par un fichier `queries/` ni par un composant. **Elles restent de simples fonctions, sans endpoint** ; leurs enveloppes dans `*.action.ts` sont des réexports directs. En leur donner un serait de la surface d'attaque gratuite.

- [ ] **Étape 1 : écrire le test qui échoue**

Un seul handler est testé — `appointments`, parce que c'est le seul des trois dont les paramètres ne sont pas des chaînes simples : il prend un intervalle de dates, et une conversion ratée y produirait un agenda vide plutôt qu'une erreur.

Créer `apps/web/app/api/internal/appointments/route.test.ts` :

```ts
import { describe, expect, it, vi } from "vitest";

const getAppointments = vi.fn();

vi.mock("#/functions/appointments.function", () => ({
  get getAppointments() { return getAppointments; },
}));

describe("GET /api/internal/appointments", () => {
  it("transmet l'intervalle de dates tel qu'il est écrit dans l'URL", async () => {
    getAppointments.mockReset();
    getAppointments.mockResolvedValue([]);
    const { GET } = await import("./route");

    await GET(
      new Request(
        "http://localhost:3001/api/internal/appointments?fromISO=2026-09-01T00:00:00.000Z&toISO=2026-09-30T23:59:59.999Z",
      ),
    );

    expect(getAppointments).toHaveBeenCalledWith({
      fromISO: "2026-09-01T00:00:00.000Z",
      toISO: "2026-09-30T23:59:59.999Z",
    });
  });

  it("répond 401 quand l'organisation n'est pas résolue", async () => {
    getAppointments.mockReset();
    getAppointments.mockRejectedValue(new Error("Organization not found"));
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost:3001/api/internal/appointments"));

    expect(response.status).toBe(401);
  });
});
```

**Avant d'écrire le handler, ouvre `lib/api/queries/appointments.query.ts`** et relève les noms exacts des champs de l'intervalle. Le test ci-dessus suppose `fromISO` / `toISO` d'après la clé de requête `["appointments", "list", range.fromISO, range.toISO]`. Si les noms diffèrent, **corrige le test avant de coder** : c'est la requête existante qui fait foi, pas ce plan.

- [ ] **Étape 2 : lancer le test et vérifier qu'il échoue**

```bash
bun --filter @biume/web test app/api/internal/appointments
```

Attendu : ÉCHEC, `Failed to load url ./route`.

- [ ] **Étape 3 : convertir les trois fichiers de fonctions**

18 fonctions au total, toutes selon le motif de l'en-tête. Le corps de chaque `handler` est recopié sans modification. Aucune n'utilise `.middleware()`.

Traite un fichier à la fois et lance `bun --filter @biume/web check-types` après chacun : les erreurs pointent alors le fichier que tu viens de toucher, au lieu d'arriver par vagues de trois.

- [ ] **Étape 4 : écrire les trois fichiers de mutations**

`patients.mutations.ts`, `appointments.mutations.ts`, `medicalDocuments.mutations.ts`, sur le modèle exact de `clients.mutations.ts` : directive `"use server"` en tête, une enveloppe `async` par mutation, aucune logique.

- [ ] **Étape 5 : écrire les trois route handlers**

`app/api/internal/patients/route.ts`, `animals/route.ts` et `appointments/route.ts`, sur le modèle de `clients/route.ts` : lecture des paramètres d'URL, conversion vers les types attendus, `Response.json`, et le même bloc `catch` qui distingue `Organization not found` en 401.

`animals/route.ts` n'a aucun paramètre : `getAllAnimals()` se contente de la session.

- [ ] **Étape 6 : réécrire les trois fichiers d'adaptation**

Dans chacun : réexporter les mutations depuis le fichier `.mutations.ts`, envelopper les trois lectures consommées par les `queries/` avec `internalGet`, et réexporter directement les autres lectures.

**Vérifie qu'aucune signature ne change.** `lib/api/queries/patients.query.ts` et `appointments.query.ts` ne doivent pas être modifiés.

- [ ] **Étape 7 : vérifier**

```bash
bun --filter @biume/web test app/api/internal
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
```

Attendu : `check-types` en code 0, et au moins `636 passed | 12 skipped`.

- [ ] **Étape 8 : commit**

```bash
git add -A apps/web
git commit -m "refactor(web): convertir patients, rendez-vous et documents médicaux

Applique aux trois ressources le motif établi sur clients. Seules les
trois lectures que consomment les fichiers queries reçoivent un route
handler ; les six autres restent de simples fonctions serveur, sans
endpoint — leur en donner un ouvrirait de la surface sans usage.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LgueajX3wogo4r7ays5nCu"
```

---

### Tâche 4 : comptes rendus

La plus grosse ressource : 11 fonctions, et celle qui porte le domaine métier du produit.

**Fichiers :**
- Modifier : `apps/web/functions/reports.function.ts` (`getLatestReports` GET, `getAllReports` GET, `getReportById` GET, `getAnatomicalParts` GET, `getPatientAnatomicalHistory` GET, `createReport` POST, `createQuickReport` POST, `updateReport` POST, `createReportSharedVersion` POST, `seedAnatomicalParts` POST, `deleteReport` POST)
- Modifier : `apps/web/functions/report-owner-content.function.ts` (`upsertReportOwnerContent` POST)
- Créer : `apps/web/lib/api/actions/reports.mutations.ts`, `reportOwnerContent.mutations.ts`
- Modifier : `apps/web/lib/api/actions/reports.action.ts`, `report-owner-content.action.ts`
- Créer : `apps/web/app/api/internal/reports/route.ts`, `reports/[id]/route.ts`, `reports/[id]/route.test.ts`

**Interfaces :**
- Consomme : `internalGet` et le motif à trois fichiers (tâche 2).
- Produit : signatures publiques inchangées pour les 12 fonctions.

**Quatre lectures ont un handler**, pas deux comme l'annonçait la première version de ce plan : `getAllReports` et `getReportById` (consommées par `reports.query.ts`), plus `getAnatomicalParts` (appelée en `useQuery` par trois composants du module de comptes rendus) et `getPatientAnatomicalHistory` (deux composants).

`getLatestReports` n'est appelée ni par une requête ni par un composant : elle reste une simple fonction, sans endpoint.

**Attention particulière :** `reports.function.ts` est le fichier le plus dense du lot et il est couvert par de nombreux tests (`report-domain.test.ts`, `report-update.service.test.ts`, `reports-update-wiring.test.ts`, `report-shared-version.service.test.ts`, entre autres). Si l'un d'eux tombe pendant la conversion, **c'est que le corps d'un handler a été modifié** — reviens au corps d'origine plutôt que d'ajuster le test.

- [ ] **Étape 1 : écrire le test qui échoue**

Créer `apps/web/app/api/internal/reports/[id]/route.test.ts`. Ce handler est le seul du lot à lire un paramètre de chemin plutôt que de requête, et Next 16 passe `params` sous forme de promesse — une erreur ici donnerait un identifiant `undefined` et un compte rendu introuvable.

```ts
import { describe, expect, it, vi } from "vitest";

const getReportById = vi.fn();

vi.mock("#/functions/reports.function", () => ({
  get getReportById() { return getReportById; },
}));

describe("GET /api/internal/reports/[id]", () => {
  it("extrait l'identifiant du chemin et le transmet à getReportById", async () => {
    getReportById.mockReset();
    getReportById.mockResolvedValue({ id: "rep_42" });
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/internal/reports/rep_42"),
      { params: Promise.resolve({ id: "rep_42" }) },
    );

    expect(getReportById).toHaveBeenCalledWith({ reportId: "rep_42" });
    await expect(response.json()).resolves.toEqual({ id: "rep_42" });
  });

  it("répond 401 quand l'organisation n'est pas résolue", async () => {
    getReportById.mockReset();
    getReportById.mockRejectedValue(new Error("Organization not found"));
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/internal/reports/rep_42"),
      { params: Promise.resolve({ id: "rep_42" }) },
    );

    expect(response.status).toBe(401);
  });
});
```

- [ ] **Étape 2 : lancer le test et vérifier qu'il échoue**

```bash
bun --filter @biume/web test "app/api/internal/reports"
```

Attendu : ÉCHEC, `Failed to load url ./route`.

- [ ] **Étape 3 : convertir les deux fichiers de fonctions**

12 fonctions selon le motif. Lance `bun --filter @biume/web test functions server` après la conversion de `reports.function.ts`, avant de passer à la suite : c'est le fichier le mieux couvert du dépôt, et ses tests sont le meilleur signal de recopie fidèle.

- [ ] **Étape 4 : écrire les mutations**

`reports.mutations.ts` (6 mutations : `createReport`, `createQuickReport`, `updateReport`, `createReportSharedVersion`, `seedAnatomicalParts`, `deleteReport`) et `reportOwnerContent.mutations.ts` (`upsertReportOwnerContent`), sur le modèle de `clients.mutations.ts`.

- [ ] **Étape 5 : écrire les deux route handlers**

`app/api/internal/reports/route.ts` sur le modèle de `clients/route.ts`.

`app/api/internal/reports/[id]/route.ts` lit son identifiant depuis `params`, que Next 16 fournit en promesse :

```ts
import { getReportById } from "#/functions/reports.function";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    return Response.json(await getReportById({ reportId: id }));
  } catch (error) {
    if (error instanceof Error && error.message === "Organization not found") {
      return Response.json({ error: "Organization not found" }, { status: 401 });
    }

    throw error;
  }
}
```

- [ ] **Étape 6 : réécrire les deux fichiers d'adaptation**

`lib/api/queries/reports.query.ts` ne doit pas être modifié. Sa clé `["reports", "detail", reportId]` et son `queryFn: () => getReportById({ reportId })` fixent la signature à respecter : `getReportById` prend **un objet**, pas une chaîne.

- [ ] **Étape 7 : vérifier**

```bash
bun --filter @biume/web test "app/api/internal"
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
```

Attendu : `check-types` en code 0, au moins `638 passed | 12 skipped`, et **tous les tests de comptes rendus verts**.

- [ ] **Étape 8 : commit**

```bash
git add -A apps/web
git commit -m "refactor(web): convertir les comptes rendus hors de createServerFn

Douze fonctions, dont le domaine métier le plus couvert du dépôt : les
tests de report-domain, report-update et report-shared-version servent
ici de preuve que les corps ont été recopiés sans dérive.

Le handler de détail lit son identifiant depuis params, que Next 16
fournit en promesse.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LgueajX3wogo4r7ays5nCu"
```

---

### Tâche 5 : tableau de bord et agenda

Contient le gain de performance le plus visible du lot.

**Fichiers :**
- Modifier : `apps/web/functions/dashboard.function.ts` (10 fonctions, toutes GET)
- Modifier : `apps/web/functions/dashboard-agenda.function.ts` (`getDashboardAgendaDay` GET)
- Modifier : `apps/web/functions/sidebar.function.ts` (`getSidebarDefaultOpen` GET)
- Modifier : `apps/web/lib/api/actions/dashboard.action.ts`, `dashboard-agenda.action.ts`
- Créer : `apps/web/app/api/internal/dashboard/agenda/route.ts`
- Créer : `apps/web/app/api/internal/dashboard/overview/route.ts` et `route.test.ts`

**Interfaces :**
- Consomme : `internalGet` et le motif à trois fichiers (tâche 2).
- Produit : signatures publiques inchangées pour les 12 fonctions. Aucune mutation dans cette tâche : les trois fichiers sont en lecture seule, donc **aucun fichier `.mutations.ts`**.

**La décision qui compte ici.** `lib/api/queries/dashboard.query.ts` compose aujourd'hui son résultat dans un `queryFn` qui lance **cinq appels en parallèle depuis le navigateur** (`getNewClientsMetric`, `getNewPatientsMetric`, `getSentReportsMetric`, `getRecentActivity`, `getDashboardAgendaDay`), soit cinq allers-retours réseau pour peindre le tableau de bord. Le handler `overview` fait cette composition côté serveur et renvoie l'objet fini. Le `queryFn` devient un appel unique.

C'est la seule endroit du lot où `lib/api/queries/` est modifié, et c'est une exception assumée : le `queryFn` change, mais **`dashboardOverviewQueryOptions` garde sa signature, sa clé de requête et la forme exacte de son résultat**. Les composants qui le consomment ne bougent pas.

- [ ] **Étape 1 : écrire le test qui échoue**

Créer `apps/web/app/api/internal/dashboard/overview/route.test.ts` :

```ts
import { describe, expect, it, vi } from "vitest";

const getNewClientsMetric = vi.fn();
const getNewPatientsMetric = vi.fn();
const getSentReportsMetric = vi.fn();
const getRecentActivity = vi.fn();
const getDashboardAgendaDay = vi.fn();

vi.mock("#/functions/dashboard.function", () => ({
  get getNewClientsMetric() { return getNewClientsMetric; },
  get getNewPatientsMetric() { return getNewPatientsMetric; },
  get getSentReportsMetric() { return getSentReportsMetric; },
  get getRecentActivity() { return getRecentActivity; },
}));
vi.mock("#/functions/dashboard-agenda.function", () => ({
  get getDashboardAgendaDay() { return getDashboardAgendaDay; },
}));

describe("GET /api/internal/dashboard/overview", () => {
  it("compose les cinq lectures côté serveur, avec les mêmes fenêtres qu'avant", async () => {
    getNewClientsMetric.mockResolvedValue({ value: 1 });
    getNewPatientsMetric.mockResolvedValue({ value: 2 });
    getSentReportsMetric.mockResolvedValue({ value: 3 });
    getRecentActivity.mockResolvedValue([{ id: "a1" }]);
    getDashboardAgendaDay.mockResolvedValue({
      selectedDate: "2026-09-05",
      appointments: [{ id: "ap1" }],
    });
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/internal/dashboard/overview?date=2026-09-05"),
    );
    const body = await response.json();

    // Les fenêtres 90/90/30/5 sont celles de dashboard.query.ts : les changer
    // modifierait silencieusement les chiffres affichés aux praticiens.
    expect(getNewClientsMetric).toHaveBeenCalledWith(90);
    expect(getNewPatientsMetric).toHaveBeenCalledWith(90);
    expect(getSentReportsMetric).toHaveBeenCalledWith(30);
    expect(getRecentActivity).toHaveBeenCalledWith(5);
    expect(getDashboardAgendaDay).toHaveBeenCalledWith("2026-09-05");

    expect(body.selectedDate).toBe("2026-09-05");
    expect(body.appointments).toEqual([{ id: "ap1" }]);
    expect(body.metrics).toEqual({
      newClients: { value: 1 },
      newPatients: { value: 2 },
      sentReports: { value: 3 },
    });
    expect(body.recentActivity).toEqual([{ id: "a1" }]);
    expect(typeof body.generatedAt).toBe("string");
  });

  it("répond 401 quand l'organisation n'est pas résolue", async () => {
    getNewClientsMetric.mockRejectedValue(new Error("Organization not found"));
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/internal/dashboard/overview?date=2026-09-05"),
    );

    expect(response.status).toBe(401);
  });
});
```

- [ ] **Étape 2 : lancer le test et vérifier qu'il échoue**

```bash
bun --filter @biume/web test "app/api/internal/dashboard"
```

Attendu : ÉCHEC, `Failed to load url ./route`.

- [ ] **Étape 3 : convertir les trois fichiers de fonctions**

12 fonctions selon le motif. `sidebar.function.ts` a déjà été touché à la tâche 1 pour son `headers()` : ne défais pas ce changement, ajoute seulement la conversion `createServerFn`.

- [ ] **Étape 4 : écrire les deux route handlers**

`app/api/internal/dashboard/agenda/route.ts` sur le modèle de `clients/route.ts`, avec le seul paramètre `date`.

`app/api/internal/dashboard/overview/route.ts` recopie la composition de `dashboard.query.ts` — **les mêmes cinq appels, les mêmes fenêtres 90 / 90 / 30 / 5, la même forme de résultat** :

```ts
import {
  getNewClientsMetric,
  getNewPatientsMetric,
  getRecentActivity,
  getSentReportsMetric,
} from "#/functions/dashboard.function";
import { getDashboardAgendaDay } from "#/functions/dashboard-agenda.function";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const selectedDate =
    new URL(request.url).searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  try {
    // Cinq lectures en parallèle, mais côté serveur : le navigateur les
    // lançait une par une sur le réseau, ici elles partagent la requête et
    // la session résolue une seule fois par `cache()`.
    const [newClients, newPatients, sentReports, recentActivity, agendaDay] =
      await Promise.all([
        getNewClientsMetric(90),
        getNewPatientsMetric(90),
        getSentReportsMetric(30),
        getRecentActivity(5),
        getDashboardAgendaDay(selectedDate),
      ]);

    return Response.json({
      generatedAt: new Date().toISOString(),
      selectedDate: agendaDay.selectedDate,
      appointments: agendaDay.appointments,
      metrics: { newClients, newPatients, sentReports },
      recentActivity,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Organization not found") {
      return Response.json({ error: "Organization not found" }, { status: 401 });
    }

    throw error;
  }
}
```

- [ ] **Étape 5 : réécrire les fichiers d'adaptation et le `queryFn` du tableau de bord**

`dashboard-agenda.action.ts` : `getDashboardAgendaDay` passe par `internalGet`.

`dashboard.action.ts` : les dix fonctions restent des réexports directs — aucune n'est appelée individuellement depuis le client une fois `overview` en place.

`lib/api/queries/dashboard.query.ts` : remplacer le corps du `queryFn` par un appel unique.

```ts
queryFn: () =>
  internalGet<DashboardOverview>("/api/internal/dashboard/overview", { date: selectedDate }),
```

**`getDashboardOverviewDate`, la clé de requête et la forme du résultat ne changent pas.** Déclare le type `DashboardOverview` d'après ce que le `queryFn` renvoyait, pour que les composants consommateurs compilent sans être touchés.

- [ ] **Étape 6 : vérifier**

```bash
bun --filter @biume/web test "app/api/internal"
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
```

Attendu : `check-types` en code 0, au moins `640 passed | 12 skipped`, et `components/dashboard/overview/dashboard-overview-view.test.tsx` **vert sans avoir été modifié** — c'est lui qui prouve que la forme du résultat n'a pas bougé.

- [ ] **Étape 7 : commit**

```bash
git add -A apps/web
git commit -m "refactor(web): convertir le tableau de bord et composer l'aperçu côté serveur

Les cinq lectures que le navigateur lançait en parallèle pour peindre le
tableau de bord sont désormais composées par un seul route handler : un
aller-retour au lieu de cinq, et la session résolue une fois par cache()
au lieu de cinq fois.

dashboard.query.ts est le seul fichier de queries que ce lot modifie, et
seulement son queryFn : la clé de requête, la signature et la forme du
résultat sont identiques, donc les composants ne bougent pas.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LgueajX3wogo4r7ays5nCu"
```

---

### Tâche 6 : session, utilisateur, organisation, et les actions porteuses

Solde du lot : les fonctions restantes et les cinq fichiers d'actions qui portaient leur propre `createServerFn`.

**Fichiers :**
- Modifier : `apps/web/functions/auth.function.ts` (`getSession` GET, `ensureSession` GET, `getOrganizations` GET, `getCurrentOrganization` GET, `switchActiveOrganization` POST)
- Modifier : `apps/web/functions/user.function.ts` (`updateUserNotifications` POST)
- Modifier : `apps/web/functions/organization.function.ts` (`updateOrganization` POST)
- Modifier : `apps/web/lib/api/actions/dashboard-shell.action.ts`, `trial.action.ts`, `email.action.ts`, `report-reminder.action.ts`, `subscription-gate.action.ts`, `auth.action.ts`
- Créer : `apps/web/lib/api/actions/user.mutations.ts`, `organization.mutations.ts`, `auth.mutations.ts`

**Interfaces :**
- Consomme : le motif à trois fichiers (tâche 2), `requireOrganizationId` (tâche 1).
- Produit : signatures publiques inchangées, notamment `getDashboardShellFn` et `startOrganizationTrialFn` — le lot C bâtira la garde du layout dashboard dessus.

Aucune de ces lectures n'est consommée par un fichier `queries/` : **aucun route handler dans cette tâche.** Les lectures deviennent de simples fonctions, appelées depuis le serveur.

**Les cinq fichiers d'actions à traiter en propre :**

| Fichier | Ce qu'il porte |
| --- | --- |
| `dashboard-shell.action.ts` | `getDashboardShellFn` (GET) — le contexte du shell en un aller-retour ; le lot C l'appelle depuis `app/dashboard/layout.tsx` |
| `trial.action.ts` | `startOrganizationTrialFn` (POST) → Server Action |
| `email.action.ts` | envoi de compte rendu par email, avec `renderToBuffer` côté serveur → Server Action |
| `report-reminder.action.ts` | programmation de rappel → Server Action |
| `subscription-gate.action.ts` | `getOrganizationSubscriptionGateFn` — garde de facturation ; le lot C l'appelle depuis le layout |

`getDashboardShellFn` et `getOrganizationSubscriptionGateFn` **gardent leur nom actuel, suffixe `Fn` compris.** Il est laid, mais le renommer toucherait `routes/dashboard.tsx`, qui doit continuer de compiler jusqu'au lot E. Le lot C les renommera en écrivant le vrai layout.

- [ ] **Étape 1 : convertir les trois fichiers de fonctions**

7 fonctions selon le motif. `auth.function.ts` a déjà été touché à la tâche 1 pour ses cinq `headers()` : ne défais pas ces changements.

- [ ] **Étape 2 : écrire les trois fichiers de mutations**

`user.mutations.ts` (`updateUserNotifications`), `organization.mutations.ts` (`updateOrganization`), `auth.mutations.ts` (`switchActiveOrganization`), sur le modèle de `clients.mutations.ts`.

- [ ] **Étape 3 : convertir les cinq fichiers d'actions porteurs**

Chacun perd son `createServerFn` selon le même motif. Les trois qui portent des mutations (`trial`, `email`, `report-reminder`) reçoivent la directive `"use server"` en tête de fichier — ils ne contiennent que des mutations, donc pas besoin de les scinder.

`dashboard-shell.action.ts` et `subscription-gate.action.ts` sont des lectures appelées uniquement depuis le serveur : fonctions ordinaires, sans directive et sans handler.

- [ ] **Étape 4 : vérifier qu'il ne reste aucune trace de `createServerFn`**

```bash
grep -rn "createServerFn\|@tanstack/react-start" apps/web --include="*.ts" --include="*.tsx" | grep -v "^apps/web/routes/"
```

Attendu : **aucun résultat**. Seul `apps/web/routes/` peut encore en contenir — il est supprimé au lot E.

- [ ] **Étape 5 : vérifier**

```bash
bun --filter @biume/web check-types
bun --filter @biume/web test 2>&1 | tail -5
bun --filter @biume/web build 2>&1 | tail -25
```

Attendu : `check-types` en code 0, au moins `640 passed | 12 skipped`, et un build qui liste les **20 routes** sous `/api` (les 7 du lot A plus les 13 nouvelles).

- [ ] **Étape 6 : commit**

```bash
git add -A apps/web
git commit -m "refactor(web): solder la conversion hors de createServerFn

Session, utilisateur, organisation, et les cinq fichiers d'actions qui
portaient leur propre createServerFn. Plus aucun fichier hors de routes/
n'importe @tanstack/react-start.

getDashboardShellFn et getOrganizationSubscriptionGateFn gardent leur
suffixe Fn : le renommer toucherait routes/dashboard.tsx, qui doit
continuer de compiler jusqu'au lot E.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LgueajX3wogo4r7ays5nCu"
```

---

## Fin du lot B

État atteint :

- Plus aucune fonction hors de `routes/` ne dépend de TanStack Start.
- Le contexte de requête est celui de Next, et la mémoïsation par requête couvre désormais les Server Actions.
- Les 11 lectures que consomme le cache client passent par 8 route handlers ; l'aperçu du tableau de bord est composé côté serveur, un aller-retour au lieu de cinq.
- Les mutations sont des Server Actions.
- **Aucune signature publique n'a changé** : les 173 composants et 5 des 6 fichiers `queries/` n'ont pas été touchés.
- La suite de tests est passée de 627 à au moins 640.

Ce que le lot B ne fait pas : aucune page n'est encore servie. C'est le lot C qui écrit `app/layout.tsx`, le shell d'authentification et le layout dashboard, et qui commence enfin à rendre l'application utilisable.

**Suite :** le plan du lot C est écrit à la fin du lot B, contre l'état réel du code.
