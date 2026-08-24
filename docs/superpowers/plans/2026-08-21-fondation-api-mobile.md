# Fondation de l'API mobile : Hono, OpenAPI et jeton porteur — Plan d'implémentation

> **Pour les agents d'exécution :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe à cases (`- [ ]`) pour le suivi.

**Objectif :** Faire de `/api/mobile/v1` une surface authentifiable par jeton porteur, routée par Hono, et décrite par un `openapi.json` que l'intégration continue vérifie — sans changer d'un octet le comportement des six endpoints existants.

**Architecture :** Le plugin `bearer` de Better Auth est ajouté pour qu'un client sans cookies puisse s'authentifier. Le routeur maison de `mobile-api.ts` — appariement de chemin manuel et `switch` — est remplacé par une application `OpenAPIHono` montée sur le handler existant. Le découpage en ports, la table des codes d'erreur et la validation des réponses contre les contrats partagés sont conservés à l'identique. La suite de 26 tests existante sert de garde-fou de non-régression et ne doit **pas** être modifiée.

**Pile technique :** Bun 1.3.11, TanStack Start, Better Auth, Hono 4.13, `@hono/zod-openapi` 1.6, Zod 4, Vitest.

**Spécification :** `docs/superpowers/specs/2026-08-21-mobile-flutter-rewrite-design.md`

## Contraintes globales

- Gestionnaire de paquets : Bun uniquement. Jamais `npm`, `yarn` ni `pnpm`.
- Express est interdit. Hono est autorisé.
- `packages/contracts` reste la source de vérité des schémas. Aucun schéma de requête ou de réponse ne doit être redéfini dans `apps/web`.
- Les messages d'erreur renvoyés au client sont génériques et en français. Rien issu d'une exception, d'une base de données ou d'un fournisseur de stockage ne doit atteindre le client.
- Une réponse est validée contre le contrat partagé avant de quitter le processus. Un port qui renvoie plus que le contrat n'autorise produit une erreur interne, jamais une fuite de champs.
- Toute route autre que `/session` exige une organisation active : c'est une précondition, pas un détail facultatif.
- `apps/web/src/server/mobile/mobile-api.test.ts` ne doit **pas** être modifié par ce plan. Ses 26 tests sont le contrat de non-régression.
- Ne jamais modifier `apps/web/src/routeTree.gen.ts` à la main.
- Chemin de base de l'API : `/api/mobile/v1`.
- Durée de vie d'une URL d'upload signée : 600 s. Taille maximale d'une capture : 16 777 216 octets. Durée maximale : 600 000 ms.

---

## Structure des fichiers

| Fichier | Responsabilité |
| --- | --- |
| `packages/auth/src/index.ts` (modifier) | Ajouter le plugin `bearer` |
| `packages/auth/src/bearer.test.ts` (créer) | Vérifier que le plugin est déclaré et que `expo` cohabite |
| `apps/web/package.json` (modifier) | Dépendances `hono` et `@hono/zod-openapi` |
| `apps/web/src/server/mobile/mobile-api.errors.ts` (créer) | Codes, messages, statuts et caractère réessayable — extraits tels quels de `mobile-api.ts` |
| `apps/web/src/server/mobile/mobile-api.routes.ts` (créer) | Descriptions `createRoute` des six endpoints |
| `apps/web/src/server/mobile/mobile-api.ts` (réécrire) | Application `OpenAPIHono`, mêmes exports publics |
| `apps/web/scripts/emit-openapi.ts` (créer) | Émettre `openapi.json` depuis l'application Hono |
| `apps/web/openapi.json` (généré, commité) | Contrat public de l'API mobile |
| `apps/web/src/server/mobile/openapi-drift.test.ts` (créer) | Échouer si le fichier commité ne correspond plus à l'application |
| `.github/workflows/ci.yml` (modifier) | Faire tourner la vérification de dérive |

**Hors périmètre de ce plan, et pourquoi.** Les endpoints métier restants — fiches propriétaire et animal, historique, déplacement de rendez-vous — arrivent dans un plan `2b`. Les endpoints de transcription, d'extraction et de suivi appartiennent aux plans 3, 4 et 5, qui créent les domaines correspondants : on n'écrit pas l'endpoint d'une table qui n'existe pas. À l'issue de ce plan, le développement Flutter peut démarrer sur l'authentification, l'agenda et la capture, ce qui est son premier jalon.

---

### Tâche 1 : Authentification par jeton porteur

Un client Dart ne gère pas de cookies de session. Le plugin `bearer` de Better Auth accepte un en-tête `Authorization: Bearer <jeton>` et renvoie le jeton dans un en-tête `set-auth-token` à la connexion. Il est déjà présent dans `node_modules` : rien à installer.

Le plugin `expo()` est **conservé** pendant toute la transition. Les deux cohabitent sans conflit, et le retirer maintenant casserait l'application Expo avant que la Flutter ne la remplace. Sa suppression appartient au plan 6, avec celle de `apps/mobile`.

**Fichiers :**
- Modifier : `packages/auth/src/index.ts:76-91`
- Test : `packages/auth/src/bearer.test.ts` (créer)

**Interfaces :**
- Consomme : rien.
- Produit : `createAuth()` déclare le plugin `bearer`. Aucun changement de signature. `authenticate(headers)` dans `mobile-api.ports.ts` continue d'appeler `auth.api.getSession({ headers })`, qui résout désormais aussi bien un cookie qu'un jeton porteur.

- [ ] **Étape 1 : Écrire le test qui échoue**

Créer `packages/auth/src/bearer.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { createAuth } from "./index";

/**
 * Le client Flutter n'a pas de cookies. Sans ce plugin, chaque requête mobile
 * repartirait en 401 sans aucun message exploitable côté client.
 */
describe("plugins d'authentification", () => {
  const pluginIds = createAuth().options.plugins.map((plugin) => plugin.id);

  it("accepte un jeton porteur", () => {
    expect(pluginIds).toContain("bearer");
  });

  it("conserve le plugin Expo pendant la transition", () => {
    expect(pluginIds).toContain("expo");
  });

  it("conserve les organisations", () => {
    expect(pluginIds).toContain("organization");
  });
});
```

- [ ] **Étape 2 : Lancer le test et vérifier qu'il échoue**

Commande : `bun --filter @biume/auth test -- bearer`

Attendu : ÉCHEC sur `expect(pluginIds).toContain("bearer")`.

Si `@biume/auth` n'a pas de script `test`, ajouter `"test": "vitest run"` à `packages/auth/package.json` et `vitest` à ses `devDependencies` avant de relancer.

- [ ] **Étape 3 : Déclarer le plugin**

Dans `packages/auth/src/index.ts`, ajouter à l'import existant depuis `better-auth/plugins` :

```ts
import { bearer, organization } from "better-auth/plugins";
```

Puis, dans le tableau `plugins`, avant `expo()` :

```ts
      // Le client mobile ne gère pas de cookies : il lit le jeton dans
      // `set-auth-token` à la connexion et le renvoie en `Authorization`.
      bearer(),
```

- [ ] **Étape 4 : Lancer le test et vérifier qu'il passe**

Commande : `bun --filter @biume/auth test -- bearer`

Attendu : SUCCÈS, 3 tests.

- [ ] **Étape 5 : Vérifier de bout en bout avec une vraie requête**

Démarrer le serveur (`bun run dev:web`), puis :

```bash
rtk curl -i -X POST http://localhost:3000/api/auth/sign-in/email \
  -H 'content-type: application/json' \
  -d '{"email":"<un compte de test>","password":"<son mot de passe>"}'
```

Attendu : la réponse porte un en-tête `set-auth-token`. Reprendre sa valeur et vérifier qu'elle authentifie :

```bash
rtk curl -i http://localhost:3000/api/mobile/v1/session \
  -H 'authorization: Bearer <la valeur de set-auth-token>'
```

Attendu : `200` et un corps portant `userId`, `organization` et `canUploadCaptures`. Ne pas poursuivre ce plan sur un `401` : tout le reste en dépend.

- [ ] **Étape 6 : Valider**

```bash
rtk git add packages/auth/
rtk git commit -m "feat(auth): accepter un jeton porteur pour le client mobile"
```

---

### Tâche 2 : Dépendances Hono

**Fichiers :**
- Modifier : `apps/web/package.json`

**Interfaces :**
- Consomme : rien.
- Produit : `hono` et `@hono/zod-openapi` disponibles dans `apps/web`.

`@hono/zod-openapi@1.6.1` déclare `zod ^4.0.0` en dépendance de pair. `apps/web` porte `zod ^4.4.3` : compatible, vérifié le 21 août 2026.

- [ ] **Étape 1 : Installer**

```bash
bun add --cwd apps/web hono@^4.13.3 @hono/zod-openapi@^1.6.1
```

- [ ] **Étape 2 : Vérifier qu'aucun avertissement de dépendance de pair n'apparaît**

Commande : `bun --filter @biume/web check-types`

Attendu : SUCCÈS, aucune erreur.

- [ ] **Étape 3 : Valider**

```bash
rtk git add apps/web/package.json bun.lock
rtk git commit -m "chore(web): ajouter hono et zod-openapi pour l'api mobile"
```

---

### Tâche 3 : Extraire la table des erreurs

La correspondance code → message → statut → caractère réessayable est aujourd'hui enfouie au milieu du routeur. Elle est réutilisée à l'identique par l'application Hono, et le plan 2b s'appuiera dessus. On l'isole avant de toucher au routage, pour que la réécriture qui suit ne mélange pas deux changements.

**Fichiers :**
- Créer : `apps/web/src/server/mobile/mobile-api.errors.ts`
- Test : `apps/web/src/server/mobile/mobile-api.errors.test.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ts` (retirer les définitions déplacées, importer depuis le nouveau module)

**Interfaces :**
- Consomme : `captureErrorCodeSchema`, `type CaptureErrorCode`, `type MobileApiError` de `@biume/contracts/capture`.
- Produit :
  - `const errorMessages: Record<CaptureErrorCode, string>`
  - `const errorStatuses: Record<CaptureErrorCode, number>`
  - `function buildMobileApiError(code: CaptureErrorCode, options?: { retryable?: boolean }): { status: number; body: MobileApiError }`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/server/mobile/mobile-api.errors.test.ts` :

```ts
import { captureErrorCodes } from "@biume/contracts/capture";
import { describe, expect, it } from "vitest";

import {
  buildMobileApiError,
  errorMessages,
  errorStatuses,
} from "./mobile-api.errors";

describe("table des erreurs de l'api mobile", () => {
  it("couvre chaque code du contrat partagé", () => {
    for (const code of captureErrorCodes) {
      expect(errorMessages[code]).toBeTruthy();
      expect(errorStatuses[code]).toBeGreaterThanOrEqual(400);
    }
  });

  it("ne laisse fuir aucun détail technique dans les messages", () => {
    for (const code of captureErrorCodes) {
      expect(errorMessages[code]).not.toMatch(/error|exception|stack|sql/i);
    }
  });

  it("marque réessayable ce qui l'est par nature", () => {
    expect(buildMobileApiError("storage_unavailable").body.retryable).toBe(true);
    expect(buildMobileApiError("rate_limited").body.retryable).toBe(true);
    expect(buildMobileApiError("network").body.retryable).toBe(true);
  });

  /**
   * Réessayer une requête refusée ne la fera jamais aboutir. Le client mobile
   * s'appuie dessus pour arrêter sa boucle sans consommer de tentative.
   */
  it("ne marque pas réessayable ce qui exige une intervention", () => {
    expect(buildMobileApiError("unauthorized").body.retryable).toBe(false);
    expect(buildMobileApiError("forbidden").body.retryable).toBe(false);
    expect(buildMobileApiError("validation").body.retryable).toBe(false);
    expect(buildMobileApiError("conflict").body.retryable).toBe(false);
  });

  it("laisse l'appelant forcer le caractère réessayable", () => {
    expect(
      buildMobileApiError("conflict", { retryable: true }).body.retryable,
    ).toBe(true);
  });

  it("associe le bon statut à chaque famille", () => {
    expect(buildMobileApiError("unauthorized").status).toBe(401);
    expect(buildMobileApiError("active_organization_required").status).toBe(409);
    expect(buildMobileApiError("expired").status).toBe(410);
    expect(buildMobileApiError("rate_limited").status).toBe(429);
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- mobile-api.errors`

Attendu : ÉCHEC, module `./mobile-api.errors` introuvable.

- [ ] **Étape 3 : Créer le module**

Créer `apps/web/src/server/mobile/mobile-api.errors.ts` en déplaçant tel quel le contenu existant de `mobile-api.ts` :

```ts
import type {
  CaptureErrorCode,
  MobileApiError,
} from "@biume/contracts/capture";

/**
 * Messages délibérément génériques et localisés. Rien issu d'une exception,
 * d'une base de données ou d'un fournisseur de stockage n'atteint le client.
 */
export const errorMessages: Record<CaptureErrorCode, string> = {
  validation: "Requête invalide.",
  unauthorized: "Session expirée, reconnectez-vous.",
  active_organization_required: "Sélectionnez une organisation.",
  forbidden: "Accès refusé.",
  method_not_allowed: "Méthode non supportée.",
  not_found: "Ressource introuvable.",
  conflict: "Cette dictée est dans un état incompatible.",
  rate_limited: "Trop de requêtes, réessayez plus tard.",
  server_error: "Une erreur interne est survenue.",
  storage_unavailable: "Stockage indisponible, réessayez plus tard.",
  object_incomplete: "L'audio envoyé est incomplet, relancez l'envoi.",
  expired: "Cette dictée a expiré.",
  network: "Connexion indisponible.",
  unknown: "Une erreur est survenue.",
};

export const errorStatuses: Record<CaptureErrorCode, number> = {
  validation: 400,
  unauthorized: 401,
  active_organization_required: 409,
  forbidden: 403,
  method_not_allowed: 405,
  not_found: 404,
  conflict: 409,
  rate_limited: 429,
  server_error: 500,
  storage_unavailable: 503,
  object_incomplete: 409,
  expired: 410,
  network: 503,
  unknown: 500,
};

const retryableByDefault = new Set<CaptureErrorCode>([
  "rate_limited",
  "server_error",
  "storage_unavailable",
  "object_incomplete",
  "network",
]);

export function buildMobileApiError(
  code: CaptureErrorCode,
  options: { retryable?: boolean } = {},
): { status: number; body: MobileApiError } {
  return {
    status: errorStatuses[code],
    body: {
      code,
      message: errorMessages[code],
      retryable: options.retryable ?? retryableByDefault.has(code),
    },
  };
}
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

Commande : `bun --filter @biume/web test -- mobile-api.errors`

Attendu : SUCCÈS, 6 tests.

- [ ] **Étape 5 : Faire consommer le module par le routeur existant**

Dans `mobile-api.ts`, supprimer `errorMessages`, `errorStatuses` et `retryableByDefault`, ajouter l'import :

```ts
import { buildMobileApiError } from "./mobile-api.errors";
```

et remplacer le corps de `errorResponse` :

```ts
function errorResponse(
  code: CaptureErrorCode,
  options: { retryable?: boolean } = {},
): Response {
  const { status, body } = buildMobileApiError(code, options);
  return jsonResponse(status, body);
}
```

- [ ] **Étape 6 : Vérifier la non-régression**

Commandes :

```bash
bun --filter @biume/web test -- mobile-api
bun --filter @biume/web check-types
```

Attendu : SUCCÈS. Les 26 tests de `mobile-api.test.ts` passent sans que le fichier ait été touché.

- [ ] **Étape 7 : Valider**

```bash
rtk git add apps/web/src/server/mobile/
rtk git commit -m "refactor(web): isoler la table des erreurs de l'api mobile"
```

---

### Tâche 4 : Remplacer le routeur maison par une application Hono

C'est le cœur du plan. `matchRoute` et son `switch` sont remplacés par des routes décrites une fois et servant à la fois au routage, à la validation et à la spécification OpenAPI.

**Le garde-fou est absolu : `mobile-api.test.ts` n'est pas touché et ses 26 tests doivent passer.** S'ils échouent, c'est la réécriture qui est fausse, jamais le test.

**Fichiers :**
- Créer : `apps/web/src/server/mobile/mobile-api.routes.ts`
- Réécrire : `apps/web/src/server/mobile/mobile-api.ts`
- Ne pas toucher : `apps/web/src/server/mobile/mobile-api.test.ts`, `mobile-api.ports.ts`, `capture.service.ts`

**Interfaces :**
- Consomme : `buildMobileApiError` de la tâche 3 ; tous les schémas de `@biume/contracts/capture` ; `CaptureServiceError` et `type CaptureActor` de `./capture.service`.
- Produit, **inchangés** :
  - `function createMobileApiHandler(ports: MobileApiPorts, options?: { now?: () => Date }): (request: Request) => Promise<Response>`
  - `type MobileApiPorts`, `type MobileSessionContext`, `type MobileAgendaQuery`, `type MobileCapturesQuery`
  - `const mobileAgendaMaxWindowMs`, `mobileAgendaMaxLimit`, `mobileAgendaDefaultLimit`
- Produit, **nouveau** :
  - `function createMobileApiApp(ports: MobileApiPorts, options?: { now?: () => Date }): OpenAPIHono`

- [ ] **Étape 1 : Écrire le test qui échoue**

Ajouter `apps/web/src/server/mobile/mobile-api.openapi.test.ts` :

```ts
import { describe, expect, it, vi } from "vitest";

import { createMobileApiApp, type MobileApiPorts } from "./mobile-api";

function createPorts(): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    listAppointments: vi.fn(async () => ({ items: [], nextCursor: null })),
    listCaptures: vi.fn(async () => ({ items: [], nextCursor: null })),
    createCapture: vi.fn(),
    createUploadSession: vi.fn(),
    completeCapture: vi.fn(),
    cancelCapture: vi.fn(),
  } as unknown as MobileApiPorts;
}

describe("application Hono de l'api mobile", () => {
  const document = createMobileApiApp(createPorts()).getOpenAPI31Document({
    openapi: "3.1.0",
    info: { title: "Biume API mobile", version: "1" },
  });

  it("décrit les six endpoints existants", () => {
    expect(Object.keys(document.paths ?? {}).sort()).toEqual([
      "/api/mobile/v1/appointments",
      "/api/mobile/v1/captures",
      "/api/mobile/v1/captures/{captureId}",
      "/api/mobile/v1/captures/{captureId}/complete",
      "/api/mobile/v1/captures/{captureId}/upload-session",
      "/api/mobile/v1/session",
    ]);
  });

  it("déclare le jeton porteur comme schéma de sécurité", () => {
    expect(document.components?.securitySchemes?.bearerAuth).toMatchObject({
      type: "http",
      scheme: "bearer",
    });
  });

  /**
   * Le client Dart génère sa gestion d'erreur depuis la spécification. Une
   * réponse d'erreur non décrite deviendrait un cas non traité sur le terrain.
   */
  it("décrit la réponse d'erreur sur chaque endpoint", () => {
    for (const [path, item] of Object.entries(document.paths ?? {})) {
      for (const [method, operation] of Object.entries(item as object)) {
        const responses = (operation as { responses?: object }).responses ?? {};
        const codes = Object.keys(responses);
        expect(
          codes.some((code) => code.startsWith("4") || code.startsWith("5")),
          `${method.toUpperCase()} ${path} ne décrit aucune réponse d'erreur`,
        ).toBe(true);
      }
    }
  });
});
```

- [ ] **Étape 2 : Lancer le test et vérifier qu'il échoue**

Commande : `bun --filter @biume/web test -- mobile-api.openapi`

Attendu : ÉCHEC, `createMobileApiApp` n'est pas exporté.

- [ ] **Étape 3 : Décrire les routes**

Créer `apps/web/src/server/mobile/mobile-api.routes.ts` :

```ts
import {
  captureResponseSchema,
  completeCaptureRequestSchema,
  createCaptureRequestSchema,
  mobileApiErrorSchema,
  mobileAppointmentsResponseSchema,
  mobileCapturesResponseSchema,
  mobileSessionResponseSchema,
  uploadSessionResponseSchema,
} from "@biume/contracts/capture";
import { createRoute, z } from "@hono/zod-openapi";

const json = <T>(schema: T) => ({ "application/json": { schema } });

const errorResponses = {
  400: { description: "Requête invalide", content: json(mobileApiErrorSchema) },
  401: { description: "Session expirée", content: json(mobileApiErrorSchema) },
  403: { description: "Accès refusé", content: json(mobileApiErrorSchema) },
  404: { description: "Introuvable", content: json(mobileApiErrorSchema) },
  409: { description: "État incompatible", content: json(mobileApiErrorSchema) },
  410: { description: "Dictée expirée", content: json(mobileApiErrorSchema) },
  429: { description: "Trop de requêtes", content: json(mobileApiErrorSchema) },
  500: { description: "Erreur interne", content: json(mobileApiErrorSchema) },
  503: { description: "Service indisponible", content: json(mobileApiErrorSchema) },
} as const;

const security = [{ bearerAuth: [] }];

export const captureIdParamsSchema = z.object({
  captureId: z.uuid().openapi({ param: { name: "captureId", in: "path" } }),
});

export const agendaQuerySchema = z
  .object({
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
    limit: z.coerce.number().int().positive().optional(),
    cursor: z.string().min(1).optional(),
  })
  .strict();

export const capturesQuerySchema = z
  .object({
    limit: z.coerce.number().int().positive().optional(),
    cursor: z.string().min(1).optional(),
  })
  .strict();

export const sessionRoute = createRoute({
  method: "get",
  path: "/session",
  security,
  summary: "Session et organisation active du praticien",
  responses: {
    200: { description: "Session", content: json(mobileSessionResponseSchema) },
    ...errorResponses,
  },
});

export const appointmentsRoute = createRoute({
  method: "get",
  path: "/appointments",
  security,
  summary: "Rendez-vous sur une fenêtre bornée",
  request: { query: agendaQuerySchema },
  responses: {
    200: {
      description: "Page de rendez-vous",
      content: json(mobileAppointmentsResponseSchema),
    },
    ...errorResponses,
  },
});

export const listCapturesRoute = createRoute({
  method: "get",
  path: "/captures",
  security,
  summary: "Dictées du praticien",
  request: { query: capturesQuerySchema },
  responses: {
    200: {
      description: "Page de dictées",
      content: json(mobileCapturesResponseSchema),
    },
    ...errorResponses,
  },
});

export const createCaptureRoute = createRoute({
  method: "post",
  path: "/captures",
  security,
  summary: "Déclarer une dictée enregistrée sur l'appareil",
  request: { body: { content: json(createCaptureRequestSchema) } },
  responses: {
    201: { description: "Dictée créée", content: json(captureResponseSchema) },
    ...errorResponses,
  },
});

export const uploadSessionRoute = createRoute({
  method: "post",
  path: "/captures/{captureId}/upload-session",
  security,
  summary: "Obtenir une URL signée pour téléverser l'audio",
  request: { params: captureIdParamsSchema },
  responses: {
    200: {
      description: "Session de téléversement",
      content: json(uploadSessionResponseSchema),
    },
    ...errorResponses,
  },
});

export const completeCaptureRoute = createRoute({
  method: "post",
  path: "/captures/{captureId}/complete",
  security,
  summary: "Confirmer que l'audio est bien arrivé",
  request: {
    params: captureIdParamsSchema,
    body: { content: json(completeCaptureRequestSchema) },
  },
  responses: {
    200: { description: "Dictée confirmée", content: json(captureResponseSchema) },
    ...errorResponses,
  },
});

export const cancelCaptureRoute = createRoute({
  method: "delete",
  path: "/captures/{captureId}",
  security,
  summary: "Annuler une dictée et supprimer son audio",
  request: { params: captureIdParamsSchema },
  responses: {
    204: { description: "Dictée annulée" },
    ...errorResponses,
  },
});
```

- [ ] **Étape 4 : Réécrire le routeur**

Réécrire `apps/web/src/server/mobile/mobile-api.ts` en trois gestes :

1. **Conserver intégralement** le haut du fichier : les imports depuis `@biume/contracts/capture` et `zod`, les constantes exportées `mobileAgendaMaxWindowMs`, `mobileAgendaMaxLimit`, `mobileAgendaDefaultLimit`, les types `MobileSessionContext`, `MobileAgendaQuery`, `MobileCapturesQuery`, `MobileApiPorts`, les schémas `agendaQuerySchema` et `capturesQuerySchema`, et la fonction `parseAgendaQuery`.
2. **Ajouter** les imports ci-dessous en tête de fichier, avec les autres.
3. **Supprimer** tout ce qui suit `parseAgendaQuery` — `RouteMatch`, `matchRoute`, `allowedMethods`, `jsonResponse`, `emptyResponse`, `errorResponse`, `validatedResponse`, `readJsonBody`, `invalidJson`, `captureIdSchema`, `createMobileApiHandler` — et le remplacer par :

```ts
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";

import { buildMobileApiError } from "./mobile-api.errors";
import {
  appointmentsRoute,
  cancelCaptureRoute,
  completeCaptureRoute,
  createCaptureRoute,
  listCapturesRoute,
  sessionRoute,
  uploadSessionRoute,
} from "./mobile-api.routes";

const noStore = { "cache-control": "no-store" } as const;

function fail(c: Context, code: CaptureErrorCode, retryable?: boolean) {
  const { status, body } = buildMobileApiError(
    code,
    retryable === undefined ? {} : { retryable },
  );
  return c.json(body, status as 400, noStore);
}

/**
 * La sortie est validée contre le contrat partagé avant de quitter le
 * processus. Un port qui renvoie plus que le contrat n'autorise produit une
 * erreur interne plutôt que de laisser fuir les champs supplémentaires.
 */
function validated<T>(
  c: Context,
  status: 200 | 201,
  schema: z.ZodType<T>,
  payload: unknown,
) {
  const result = schema.safeParse(payload);
  if (!result.success) return fail(c, "server_error");
  return c.json(result.data, status, noStore);
}

type Variables = {
  session: MobileSessionContext;
  actor: CaptureActor;
};

export function createMobileApiApp(
  ports: MobileApiPorts,
  options: { now?: () => Date } = {},
) {
  const now = options.now ?? (() => new Date());
  const app = new OpenAPIHono<{ Variables: Variables }>({
    // Une charge que Zod rejette est une requête invalide, pas une erreur
    // interne, et le client doit recevoir le contrat d'erreur habituel.
    defaultHook: (result, c) => {
      if (!result.success) return fail(c, "validation");
    },
  }).basePath("/api/mobile/v1");

  app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
  });

  app.use("*", async (c, next) => {
    const session = await ports.authenticate(c.req.raw.headers);
    if (!session) return fail(c, "unauthorized");
    c.set("session", session);
    await next();
  });

  app.openapi(sessionRoute, (c) => {
    const session = c.get("session");
    return validated(c, 200, mobileSessionResponseSchema, {
      userId: session.userId,
      organization: session.organization,
      canUploadCaptures: session.organization !== null,
    });
  });

  // Toute route au-delà de `/session` lit ou écrit des données de locataire :
  // l'organisation active est une précondition, pas un détail facultatif.
  app.use("*", async (c, next) => {
    const session = c.get("session");
    if (!session.organization) return fail(c, "active_organization_required");
    c.set("actor", {
      practitionerId: session.userId,
      organizationId: session.organization.id,
    });
    await next();
  });

  app.openapi(appointmentsRoute, async (c) => {
    const query = parseAgendaQuery(new URL(c.req.url), now());
    if ("error" in query) return fail(c, "validation");
    const page = await ports.listAppointments(c.get("actor"), query);
    return validated(c, 200, mobileAppointmentsResponseSchema, page);
  });

  app.openapi(listCapturesRoute, async (c) => {
    const { limit, cursor } = c.req.valid("query");
    const page = await ports.listCaptures(c.get("actor"), {
      limit: Math.min(limit ?? mobileAgendaDefaultLimit, mobileAgendaMaxLimit),
      cursor: cursor ?? null,
    });
    return validated(c, 200, mobileCapturesResponseSchema, page);
  });

  app.openapi(createCaptureRoute, async (c) => {
    const created = await ports.createCapture(
      c.get("actor"),
      c.req.valid("json"),
    );
    return validated(c, 201, captureResponseSchema, created);
  });

  app.openapi(uploadSessionRoute, async (c) => {
    const uploadSession = await ports.createUploadSession(
      c.get("actor"),
      c.req.valid("param").captureId,
    );
    return validated(c, 200, uploadSessionResponseSchema, uploadSession);
  });

  app.openapi(completeCaptureRoute, async (c) => {
    const confirmed = await ports.completeCapture(
      c.get("actor"),
      c.req.valid("param").captureId,
      c.req.valid("json"),
    );
    return validated(c, 200, captureResponseSchema, confirmed);
  });

  app.openapi(cancelCaptureRoute, async (c) => {
    await ports.cancelCapture(c.get("actor"), c.req.valid("param").captureId);
    return c.body(null, 204, noStore);
  });

  app.notFound((c) => fail(c, "not_found"));

  app.onError((error, c) => {
    if (error instanceof CaptureServiceError) {
      return fail(c, error.code, error.retryable);
    }
    // Tout le reste est un détail d'implémentation : journalisé en amont,
    // jamais sérialisé vers le client.
    return fail(c, "server_error");
  });

  return app;
}

export function createMobileApiHandler(
  ports: MobileApiPorts,
  options: { now?: () => Date } = {},
) {
  const app = createMobileApiApp(ports, options);
  return (request: Request): Promise<Response> => app.fetch(request);
}

export async function handleMobileApiRequest(
  request: Request,
): Promise<Response> {
  const { createProductionMobileApiPorts } = await import("./mobile-api.ports");
  return createMobileApiHandler(await createProductionMobileApiPorts())(request);
}
```

- [ ] **Étape 5 : Lancer la suite complète**

Commande : `bun --filter @biume/web test -- mobile-api`

Attendu : SUCCÈS. Les 26 tests de `mobile-api.test.ts` **et** les 3 tests OpenAPI passent.

Les écarts probables si un test échoue, dans l'ordre où les chercher :

1. **Méthode non supportée.** Hono renvoie 404 là où le routeur maison renvoyait 405. Si un test l'exige, ajouter avant `app.notFound` un `app.all("/captures/:captureId", (c) => fail(c, "method_not_allowed"))` pour chaque chemin concerné.
2. **Identifiant de capture invalide.** L'ancien routeur renvoyait `validation` ; le `defaultHook` doit produire le même code sur un `captureId` qui n'est pas un UUID.
3. **En-tête `cache-control`.** Chaque réponse, y compris les erreurs et le 204, doit porter `no-store`.
4. **Corps JSON vide.** L'ancien `readJsonBody` traitait un corps vide comme `{}`. Si un test le couvre, ajouter un intergiciel qui remplace un corps vide par `{}` avant validation sur les routes POST.

- [ ] **Étape 6 : Vérifier les types et l'application entière**

Commandes :

```bash
bun --filter @biume/web check-types
bun --filter @biume/web test
```

Attendu : SUCCÈS pour les deux.

- [ ] **Étape 7 : Vérifier en conditions réelles**

Serveur démarré, avec le jeton de la tâche 1 :

```bash
rtk curl -i "http://localhost:3000/api/mobile/v1/appointments" -H 'authorization: Bearer <jeton>'
rtk curl -i "http://localhost:3000/api/mobile/v1/inconnu" -H 'authorization: Bearer <jeton>'
```

Attendu : `200` avec `items` et `nextCursor` pour la première ; `404` avec un corps `{ code, message, retryable }` pour la seconde.

- [ ] **Étape 8 : Valider**

```bash
rtk git add apps/web/src/server/mobile/
rtk git commit -m "refactor(web): router l'api mobile avec hono et decrire ses routes"
```

---

### Tâche 5 : Émettre et commiter `openapi.json`

Le fichier commité est le contrat que le client Dart lit. C'est lui qui rend la dérive de schéma détectable au lieu d'être découverte en clientèle.

**Fichiers :**
- Créer : `apps/web/scripts/emit-openapi.ts`
- Créer : `apps/web/openapi.json` (généré)
- Modifier : `apps/web/package.json` (script `emit-openapi`)

**Interfaces :**
- Consomme : `createMobileApiApp` de la tâche 4.
- Produit : `bun --filter @biume/web emit-openapi` écrit `apps/web/openapi.json`, indenté à deux espaces et terminé par un saut de ligne.

- [ ] **Étape 1 : Construire le document sans toucher aux ports**

Créer `apps/web/src/server/mobile/openapi-document.ts` :

```ts
import { createMobileApiApp, type MobileApiPorts } from "./mobile-api";

/**
 * Les ports ne sont jamais appelés : seule la description des routes est lue.
 * Construire le document ne doit toucher ni la base, ni le stockage objet, ni
 * la configuration — il doit pouvoir tourner en intégration continue sans
 * secret.
 */
const unusedPorts = new Proxy({} as MobileApiPorts, {
  get() {
    throw new Error(
      "La génération du document OpenAPI ne doit appeler aucun port.",
    );
  },
});

export function buildOpenApiDocument() {
  return createMobileApiApp(unusedPorts).getOpenAPI31Document({
    openapi: "3.1.0",
    info: {
      title: "Biume — API mobile",
      version: "1",
      description:
        "Surface consommée par l'application mobile Biume. Authentification par jeton porteur.",
    },
  });
}
```

- [ ] **Étape 2 : Écrire le script qui appelle le module**

Créer `apps/web/scripts/emit-openapi.ts` :

```ts
import { buildOpenApiDocument } from "../src/server/mobile/openapi-document";

const target = new URL("../openapi.json", import.meta.url);

await Bun.write(target, `${JSON.stringify(buildOpenApiDocument(), null, 2)}\n`);

console.log(`openapi.json écrit dans ${target.pathname}`);
```

- [ ] **Étape 3 : Déclarer le script**

Dans `apps/web/package.json`, ajouter aux `scripts` :

```json
    "emit-openapi": "bun run scripts/emit-openapi.ts",
```

- [ ] **Étape 4 : Générer et inspecter**

Commandes :

```bash
bun --filter @biume/web emit-openapi
rtk json apps/web/openapi.json
```

Attendu : le fichier existe et décrit les six chemins avec `bearerAuth` en schéma de sécurité.

- [ ] **Étape 5 : Valider**

```bash
rtk git add apps/web/scripts/emit-openapi.ts apps/web/src/server/mobile/openapi-document.ts apps/web/openapi.json apps/web/package.json
rtk git commit -m "feat(web): emettre le contrat openapi de l'api mobile"
```

---

### Tâche 6 : Détecter la dérive du contrat en intégration continue

Un `openapi.json` commité qui ne correspond plus au code est pire que pas de contrat du tout : le client Dart serait généré et validé contre un mensonge.

**Fichiers :**
- Créer : `apps/web/src/server/mobile/openapi-drift.test.ts`
- Modifier : `.github/workflows/ci.yml`

**Interfaces :**
- Consomme : `buildOpenApiDocument` de la tâche 5.
- Produit : un test qui échoue si `apps/web/openapi.json` diffère du document construit.

- [ ] **Étape 1 : Écrire le test**

Créer `apps/web/src/server/mobile/openapi-drift.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { buildOpenApiDocument } from "./openapi-document";

describe("contrat openapi commité", () => {
  /**
   * Ce test est le garde-fou de tout le projet mobile : les modèles Dart sont
   * écrits à la main contre ce fichier. S'il ment, l'application ment.
   */
  it("correspond exactement aux routes de l'application", async () => {
    const committed = await Bun.file(
      new URL("../../../openapi.json", import.meta.url).pathname,
    ).json();

    expect(committed).toEqual(JSON.parse(JSON.stringify(buildOpenApiDocument())));
  });
});
```

- [ ] **Étape 2 : Lancer le test et vérifier qu'il passe**

Commande : `bun --filter @biume/web test -- openapi-drift`

Attendu : SUCCÈS, 1 test.

- [ ] **Étape 3 : Vérifier que le test échoue quand il doit échouer**

Modifier temporairement un `summary` dans `mobile-api.routes.ts`, relancer :

Commande : `bun --filter @biume/web test -- openapi-drift`

Attendu : ÉCHEC. Annuler la modification et vérifier que le test repasse. **Ne pas sauter cette étape :** un test de dérive qui ne détecte rien est plus dangereux qu'aucun test.

- [ ] **Étape 4 : Ajouter les tests d'authentification à la CI**

Dans `.github/workflows/ci.yml`, ajouter après l'étape « Tests des contrats partagés » :

```yaml
      - name: Tests de l'authentification
        run: bun --filter @biume/auth test
```

Le test de dérive tourne déjà : il fait partie des tests de `@biume/web`.

- [ ] **Étape 5 : Vérifier localement puis en CI**

Commandes :

```bash
bun run check-types
bun --filter @biume/web test
bun --filter @biume/auth test
bun --filter @biume/contracts test
```

Attendu : SUCCÈS pour les quatre. Pousser, ouvrir une pull request, puis `rtk gh pr checks`.

Attendu : le job `verify` est vert. Ne pas clore ce plan sur un job rouge ni sur un job jamais déclenché.

- [ ] **Étape 6 : Valider**

```bash
rtk git add apps/web/src/server/mobile/openapi-drift.test.ts .github/workflows/ci.yml
rtk git commit -m "ci: echouer si le contrat openapi commite derive du code"
```

---

## Critères d'acceptation du plan

- Une connexion par `POST /api/auth/sign-in/email` renvoie un en-tête `set-auth-token`, et ce jeton authentifie `GET /api/mobile/v1/session` en `Authorization: Bearer`.
- Les 26 tests de `mobile-api.test.ts` passent sans que le fichier ait été modifié.
- `apps/web/openapi.json` décrit les six endpoints, avec `bearerAuth` et une réponse d'erreur sur chacun.
- Modifier une route sans régénérer `openapi.json` fait échouer l'intégration continue, ce qui a été vérifié en provoquant l'échec.
- Aucune réponse ne porte de message dérivé d'une exception, d'une base de données ou d'un fournisseur de stockage.
- La génération du document OpenAPI ne touche ni la base, ni le stockage objet, ni aucun secret.
