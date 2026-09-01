# Workflow de paiement Autumn.js (essai 15 jours) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compléter l'intégration Autumn.js existante dans `apps/web` pour que l'essai de 15 jours démarre automatiquement à la création d'une organisation, que l'accès au dashboard soit bloqué dès qu'aucun abonnement actif/à l'essai n'existe, et que le choix mensuel/annuel soit réellement disponible.

**Architecture:** Deux modules purs testables sans réseau (`server/billing/start-trial.ts`, `server/billing/subscription-gate.ts`), chacun avec un fichier de câblage de production (`*.deps.ts`) qui parle au SDK `autumn-js` server-side. Deux server functions TanStack (`lib/api/actions/trial.action.ts`, `lib/api/actions/subscription-gate.action.ts`) exposent ces modules aux routes. `dashboard.tsx` et `dashboard_.reports_.$id_.edit.tsx` appellent la gate dans leur `beforeLoad` ; `create-organization.tsx` déclenche le démarrage d'essai après la création de l'organisation ; `settings.tsx` reçoit un sélecteur de plan et lit les search params `tab`/`blocked`.

**Tech Stack:** TanStack Start (`createServerFn`, `createFileRoute`), `autumn-js` (SDK server `Autumn`, hook client `autumn-js/react`), `atmn` (config des plans), Drizzle/Postgres, Trigger.dev v3, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-01-autumn-payment-trial-workflow-design.md`

## Global Constraints

- Plan attaché par défaut au démarrage de l'essai : **mensuel** (`autumnPlanIds.allInclusiveMonthly`).
- Durée d'essai : **15 jours**, sans carte requise (`cardRequired: false`, déjà en config — ne pas y toucher).
- Le blocage exempte uniquement `/dashboard/settings` (toutes ses sous-vues/tabs) — toute autre route sous `/dashboard/*` redirige si l'organisation active n'a pas d'abonnement `active` ou `trialing`.
- En cas d'échec réseau vers Autumn dans la vérification de blocage : **fail-open** (laisser passer), jamais bloquer le dashboard sur une panne tierce.
- En cas d'échec de l'`attach()` au démarrage d'essai : ne jamais bloquer la création de l'organisation elle-même — logger et laisser le filet du paywall rattraper au prochain accès.
- Aucune modification du périmètre mobile Flutter, aucun gating fin par feature au-delà de la présence/absence d'abonnement (un seul tier de prix).
- Style : commentaires uniquement quand le POURQUOI n'est pas évident (cf. conventions déjà en place dans `send-followup.trigger.ts` / `followup.deps.ts`).

---

### Task 1: Corriger le bug `included: 0` dans `autumn.config.ts`

**Files:**
- Modify: `apps/web/autumn.config.ts`
- Test: `apps/web/autumn.config.test.ts`

**Interfaces:**
- Consumes: rien (fichier de config indépendant).
- Produces: `allInclusiveMonthly`, `allInclusiveYearly` (déjà exportés) — leurs `items` n'ont plus de champ `included` sur les features booléennes. Les tâches suivantes ne dépendent pas de ce détail interne, mais toute vérification `check()` future en bénéficiera.

- [ ] **Step 1: Écrire le test qui échoue**

Ajouter à la fin de `apps/web/autumn.config.test.ts` :

```ts
describe("Autumn boolean feature items", () => {
  test.each([
    ["monthly", allInclusiveMonthly],
    ["yearly", allInclusiveYearly],
  ] as const)("%s plan grants boolean features without an included quantity", (_name, plan) => {
    for (const item of plan.items ?? []) {
      expect(item).not.toHaveProperty("included");
    }
  });
});
```

- [ ] **Step 2: Vérifier que le test échoue**

Run: `cd apps/web && bun run test -- autumn.config.test.ts`
Expected: FAIL — chaque `item` a actuellement `included: 0`.

- [ ] **Step 3: Corriger `autumn.config.ts`**

Dans les deux plans (`allInclusiveMonthly` et `allInclusiveYearly`), remplacer chaque :

```ts
item({
  featureId: exportPdfProfessionnel.id,
  included: 0,
}),
```

par :

```ts
item({
  featureId: exportPdfProfessionnel.id,
}),
```

... pour les six features (`exportPdfProfessionnel`, `fichesClientsPatientsIllimits`, `iaVulgarisation`, `rapportsIllimits`, `suiviDeSantIntelligent`, `supportPrioritaire`), dans les deux plans.

- [ ] **Step 4: Vérifier que les tests passent**

Run: `cd apps/web && bun run test -- autumn.config.test.ts`
Expected: PASS (les deux describe blocks).

- [ ] **Step 5: Commit**

```bash
git add apps/web/autumn.config.ts apps/web/autumn.config.test.ts
git commit -m "fix(billing): retirer included:0 sur les features booléennes Autumn"
```

---

### Task 2: `server/billing/start-trial.ts` — orchestration pure du démarrage d'essai

**Files:**
- Create: `apps/web/src/server/billing/start-trial.ts`
- Test: `apps/web/src/server/billing/start-trial.test.ts`

**Interfaces:**
- Consumes: `autumnPlanIds` de `#/lib/constants/autumn-ids` (déjà existant).
- Produces:
  - `export const TRIAL_DURATION_DAYS = 15`
  - `export type StartOrganizationTrialInput = { organizationId: string; organizationName: string; ownerEmail: string; ownerUserId: string }`
  - `export type StartOrganizationTrialDeps = { upsertCustomer(input: { customerId: string; name: string; email: string; metadata: Record<string, string> }): Promise<void>; attachPlan(input: { customerId: string; planId: string }): Promise<void>; triggerTrialEmails(input: { organizationId: string; organizationName: string; organizationEmail: string; trialStart: string; trialEnd: string }): Promise<void>; now(): Date }`
  - `export async function startOrganizationTrial(deps: StartOrganizationTrialDeps, input: StartOrganizationTrialInput): Promise<{ trialStart: string; trialEnd: string }>`
  - Tâches consommatrices (Task 4) importent ces types et cette fonction.

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `apps/web/src/server/billing/start-trial.test.ts` :

```ts
import { describe, expect, it, vi } from "vitest";

import { startOrganizationTrial, TRIAL_DURATION_DAYS, type StartOrganizationTrialDeps } from "./start-trial";
import { autumnPlanIds } from "#/lib/constants/autumn-ids";

const now = new Date("2026-09-01T10:00:00.000Z");

function createDeps(overrides: Partial<StartOrganizationTrialDeps> = {}): StartOrganizationTrialDeps {
  return {
    upsertCustomer: vi.fn(async () => {}),
    attachPlan: vi.fn(async () => {}),
    triggerTrialEmails: vi.fn(async () => {}),
    now: () => now,
    ...overrides,
  };
}

const input = {
  organizationId: "org-1",
  organizationName: "Clinique Test",
  ownerEmail: "owner@example.test",
  ownerUserId: "user-1",
};

describe("démarrage de l'essai Autumn", () => {
  it("crée/aligne le customer puis attache le plan mensuel", async () => {
    const deps = createDeps();

    await startOrganizationTrial(deps, input);

    expect(deps.upsertCustomer).toHaveBeenCalledWith({
      customerId: "org-1",
      name: "Clinique Test",
      email: "owner@example.test",
      metadata: { organizationId: "org-1", ownerUserId: "user-1" },
    });
    expect(deps.attachPlan).toHaveBeenCalledWith({
      customerId: "org-1",
      planId: autumnPlanIds.allInclusiveMonthly,
    });
  });

  it("calcule trialEnd à 15 jours de trialStart", async () => {
    const deps = createDeps();

    const result = await startOrganizationTrial(deps, input);

    expect(result.trialStart).toBe(now.toISOString());
    const expectedEnd = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
    expect(result.trialEnd).toBe(expectedEnd.toISOString());
    expect(deps.triggerTrialEmails).toHaveBeenCalledWith({
      organizationId: "org-1",
      organizationName: "Clinique Test",
      organizationEmail: "owner@example.test",
      trialStart: now.toISOString(),
      trialEnd: expectedEnd.toISOString(),
    });
  });

  /**
   * L'attach a déjà réussi : un échec d'envoi d'email ne doit pas faire
   * échouer le démarrage d'essai lui-même (isolation, cf. runFollowUpBatch).
   */
  it("isole un échec de triggerTrialEmails sans relancer d'erreur", async () => {
    const deps = createDeps({
      triggerTrialEmails: vi.fn(async () => {
        throw new Error("trigger.dev indisponible");
      }),
    });

    await expect(startOrganizationTrial(deps, input)).resolves.toEqual({
      trialStart: now.toISOString(),
      trialEnd: new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  it("propage un échec d'attachPlan (bloquant, contrairement aux emails)", async () => {
    const deps = createDeps({
      attachPlan: vi.fn(async () => {
        throw new Error("Autumn indisponible");
      }),
    });

    await expect(startOrganizationTrial(deps, input)).rejects.toThrow("Autumn indisponible");
  });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

Run: `cd apps/web && bun run test -- server/billing/start-trial.test.ts`
Expected: FAIL avec « Cannot find module './start-trial' ».

- [ ] **Step 3: Implémenter `start-trial.ts`**

Créer `apps/web/src/server/billing/start-trial.ts` :

```ts
import { autumnPlanIds } from "#/lib/constants/autumn-ids";

export const TRIAL_DURATION_DAYS = 15;

export type StartOrganizationTrialInput = {
  organizationId: string;
  organizationName: string;
  ownerEmail: string;
  ownerUserId: string;
};

export type StartOrganizationTrialDeps = {
  upsertCustomer(input: {
    customerId: string;
    name: string;
    email: string;
    metadata: Record<string, string>;
  }): Promise<void>;
  attachPlan(input: { customerId: string; planId: string }): Promise<void>;
  triggerTrialEmails(input: {
    organizationId: string;
    organizationName: string;
    organizationEmail: string;
    trialStart: string;
    trialEnd: string;
  }): Promise<void>;
  now(): Date;
};

export async function startOrganizationTrial(
  deps: StartOrganizationTrialDeps,
  input: StartOrganizationTrialInput,
): Promise<{ trialStart: string; trialEnd: string }> {
  const trialStart = deps.now();
  const trialEnd = new Date(
    trialStart.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000,
  );

  await deps.upsertCustomer({
    customerId: input.organizationId,
    name: input.organizationName,
    email: input.ownerEmail,
    metadata: {
      organizationId: input.organizationId,
      ownerUserId: input.ownerUserId,
    },
  });

  // Doit réussir avant les emails : sans plan attaché, l'organisation reste
  // bloquée par le paywall même si les emails sont partis.
  await deps.attachPlan({
    customerId: input.organizationId,
    planId: autumnPlanIds.allInclusiveMonthly,
  });

  const trialStartIso = trialStart.toISOString();
  const trialEndIso = trialEnd.toISOString();

  try {
    await deps.triggerTrialEmails({
      organizationId: input.organizationId,
      organizationName: input.organizationName,
      organizationEmail: input.ownerEmail,
      trialStart: trialStartIso,
      trialEnd: trialEndIso,
    });
  } catch (error) {
    console.error(
      `[Autumn] Échec du déclenchement des emails d'essai pour ${input.organizationId}`,
      error,
    );
  }

  return { trialStart: trialStartIso, trialEnd: trialEndIso };
}
```

- [ ] **Step 4: Vérifier que les tests passent**

Run: `cd apps/web && bun run test -- server/billing/start-trial.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/server/billing/start-trial.ts apps/web/src/server/billing/start-trial.test.ts
git commit -m "feat(billing): orchestration pure du démarrage d'essai Autumn"
```

---

### Task 3: `server/billing/subscription-gate.ts` — décision de blocage pure

**Files:**
- Create: `apps/web/src/server/billing/subscription-gate.ts`
- Test: `apps/web/src/server/billing/subscription-gate.test.ts`

**Interfaces:**
- Consumes: rien.
- Produces:
  - `export type SubscriptionForGate = { status: string }`
  - `export function hasActiveOrTrialingSubscription(subscriptions: SubscriptionForGate[]): boolean`
  - `export function getBillingGateRedirectTarget(pathname: string, hasActiveOrTrialing: boolean): "/dashboard/settings" | null`
  - Consommé par Task 6 (`dashboard.tsx`) et Task 7 (`dashboard_.reports_.$id_.edit.tsx`).

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `apps/web/src/server/billing/subscription-gate.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import {
  getBillingGateRedirectTarget,
  hasActiveOrTrialingSubscription,
} from "./subscription-gate";

describe("hasActiveOrTrialingSubscription", () => {
  it("est vrai si une subscription est active", () => {
    expect(hasActiveOrTrialingSubscription([{ status: "active" }])).toBe(true);
  });

  it("est vrai si une subscription est trialing", () => {
    expect(hasActiveOrTrialingSubscription([{ status: "trialing" }])).toBe(true);
  });

  it("est faux si aucune subscription", () => {
    expect(hasActiveOrTrialingSubscription([])).toBe(false);
  });

  it("est faux si toutes annulées/expirées", () => {
    expect(
      hasActiveOrTrialingSubscription([{ status: "canceled" }, { status: "past_due" }]),
    ).toBe(false);
  });
});

describe("getBillingGateRedirectTarget", () => {
  it("ne redirige pas quand un abonnement actif/trialing existe", () => {
    expect(getBillingGateRedirectTarget("/dashboard/agenda", true)).toBeNull();
  });

  it("redirige vers /dashboard/settings sans abonnement", () => {
    expect(getBillingGateRedirectTarget("/dashboard/agenda", false)).toBe(
      "/dashboard/settings",
    );
  });

  it("n'entre pas en boucle sur /dashboard/settings lui-même", () => {
    expect(getBillingGateRedirectTarget("/dashboard/settings", false)).toBeNull();
  });

  it("exempte aussi les sous-chemins de /dashboard/settings", () => {
    expect(getBillingGateRedirectTarget("/dashboard/settings/team", false)).toBeNull();
  });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

Run: `cd apps/web && bun run test -- server/billing/subscription-gate.test.ts`
Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter `subscription-gate.ts`**

```ts
export type SubscriptionForGate = { status: string };

export function hasActiveOrTrialingSubscription(
  subscriptions: SubscriptionForGate[],
): boolean {
  return subscriptions.some((subscription) =>
    ["active", "trialing"].includes(subscription.status),
  );
}

export function getBillingGateRedirectTarget(
  pathname: string,
  hasActiveOrTrialing: boolean,
): "/dashboard/settings" | null {
  if (hasActiveOrTrialing) {
    return null;
  }

  if (pathname.startsWith("/dashboard/settings")) {
    return null;
  }

  return "/dashboard/settings";
}
```

- [ ] **Step 4: Vérifier que les tests passent**

Run: `cd apps/web && bun run test -- server/billing/subscription-gate.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/server/billing/subscription-gate.ts apps/web/src/server/billing/subscription-gate.test.ts
git commit -m "feat(billing): décision pure de blocage dashboard sans abonnement actif"
```

---

### Task 4: Câblage de production `start-trial.deps.ts` + server function `trial.action.ts`

**Files:**
- Create: `apps/web/src/server/billing/start-trial.deps.ts`
- Create: `apps/web/src/lib/api/actions/trial.action.ts`

**Interfaces:**
- Consumes: `StartOrganizationTrialDeps`, `startOrganizationTrial` (Task 2) ; `env` de `@biume/env/server` ; `trialWorkflow` de `#/trigger/trial.trigger` ; `getSession` de `#/functions/auth.function`.
- Produces:
  - `export function createProductionStartTrialDeps(): StartOrganizationTrialDeps`
  - `export const startOrganizationTrialFn` (server function `createServerFn`, validator `{ organizationId: string; organizationName: string }`) — consommée par Task 5.

Aucun test dédié pour ces deux fichiers (câblage réseau/SDK, non testé unitairement dans ce dépôt — cf. `server/followup/followup.deps.ts`, non couvert lui non plus ; la logique testée vit dans Task 2).

- [ ] **Step 1: Écrire `start-trial.deps.ts`**

```ts
import { Autumn } from "autumn-js";

import { env } from "@biume/env/server";
import { trialWorkflow } from "#/trigger/trial.trigger";
import type { StartOrganizationTrialDeps } from "./start-trial";

export function createProductionStartTrialDeps(): StartOrganizationTrialDeps {
  const client = new Autumn({ secretKey: env.AUTUMN_SECRET_KEY });

  return {
    now: () => new Date(),
    async upsertCustomer({ customerId, name, email, metadata }) {
      await client.customers.getOrCreate({ customerId, name, email, metadata });
    },
    async attachPlan({ customerId, planId }) {
      await client.billing.attach({ customerId, planId });
    },
    async triggerTrialEmails(input) {
      await trialWorkflow.trigger(input);
    },
  };
}
```

- [ ] **Step 2: Écrire `trial.action.ts`**

```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getSession } from "#/functions/auth.function";
import { startOrganizationTrial } from "#/server/billing/start-trial";
import { createProductionStartTrialDeps } from "#/server/billing/start-trial.deps";

const startOrganizationTrialSchema = z.object({
  organizationId: z.string().min(1),
  organizationName: z.string().min(1),
});

export const startOrganizationTrialFn = createServerFn({ method: "POST" })
  .validator(startOrganizationTrialSchema)
  .handler(async ({ data }) => {
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    try {
      await startOrganizationTrial(createProductionStartTrialDeps(), {
        organizationId: data.organizationId,
        organizationName: data.organizationName,
        ownerEmail: session.user.email,
        ownerUserId: session.user.id,
      });
    } catch (error) {
      // Non bloquant : l'organisation existe déjà côté better-auth. Le
      // paywall (Task 6/7) rattrape au prochain accès dashboard.
      console.error(
        `[Autumn] Impossible de démarrer l'essai pour l'organisation ${data.organizationId}`,
        error,
      );
    }

    return { started: true };
  });
```

- [ ] **Step 3: Vérifier la compilation TypeScript**

Run: `cd apps/web && bun run check-types`
Expected: aucune nouvelle erreur sur ces deux fichiers.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/server/billing/start-trial.deps.ts apps/web/src/lib/api/actions/trial.action.ts
git commit -m "feat(billing): câblage Autumn + server function de démarrage d'essai"
```

---

### Task 5: Déclencher l'essai à la création de l'organisation

**Files:**
- Modify: `apps/web/src/routes/create-organization.tsx:138-178`

**Interfaces:**
- Consumes: `startOrganizationTrialFn` (Task 4).
- Produces: rien de nouveau — comportement observable seulement (l'org créée a un abonnement `trialing`).

- [ ] **Step 1: Ajouter l'import**

Dans `apps/web/src/routes/create-organization.tsx`, à côté des autres imports `#/...` :

```ts
import { startOrganizationTrialFn } from "#/lib/api/actions/trial.action";
```

- [ ] **Step 2: Appeler la server function après la création réussie**

Remplacer :

```ts
    const result = await organizationClient.create({
      name: organizationName,
      slug: organizationSlug,
      logo: logoUrl || undefined,
    });

    if (result.error) {
      setError(
        result.error.message ||
          "Impossible de créer cette entreprise pour le moment.",
      );
      setIsPending(false);
      return;
    }

    window.location.replace("/dashboard");
```

par :

```ts
    const result = await organizationClient.create({
      name: organizationName,
      slug: organizationSlug,
      logo: logoUrl || undefined,
    });

    if (result.error) {
      setError(
        result.error.message ||
          "Impossible de créer cette entreprise pour le moment.",
      );
      setIsPending(false);
      return;
    }

    // Best-effort : un échec ne doit pas empêcher l'accès à l'organisation
    // fraîchement créée, le paywall du dashboard rattrape sinon.
    await startOrganizationTrialFn({
      data: { organizationId: result.data.id, organizationName: result.data.name },
    }).catch(() => {});

    window.location.replace("/dashboard");
```

- [ ] **Step 3: Vérifier la compilation et les tests existants**

Run: `cd apps/web && bun run check-types && bun run test -- create-organization`
Expected: pas de nouvelle erreur (aucun test existant sur ce fichier à ce jour — la vérification manuelle se fera à l'étape QA de fin de plan).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/routes/create-organization.tsx
git commit -m "feat(billing): démarrer l'essai Autumn à la création de l'organisation"
```

---

### Task 6: Server function de vérification d'abonnement + branchement dans `dashboard.tsx`

**Files:**
- Create: `apps/web/src/lib/api/actions/subscription-gate.action.ts`
- Modify: `apps/web/src/routes/dashboard.tsx`
- Test: `apps/web/src/routes/dashboard.test.ts` (nouveau — teste uniquement la logique pure déjà couverte ; ce fichier vérifie le branchement du `beforeLoad` via une fonction extraite testable)

**Interfaces:**
- Consumes: `getBillingGateRedirectTarget`, `hasActiveOrTrialingSubscription` (Task 3) ; `Autumn` SDK ; `env`.
- Produces:
  - `export const getOrganizationSubscriptionGateFn` (server function, validator `{ organizationId: string }`, retourne `{ hasActiveOrTrialingSubscription: boolean }`, fail-open sur erreur).
  - `dashboard.tsx` exporte en plus `resolveDashboardBillingRedirect(pathname, hasActiveOrTrialing)` (ré-export fin de `getBillingGateRedirectTarget` gardé sous ce nom dans ce fichier pour cohérence avec `getDashboardRedirectTarget` déjà exporté) — consommé par Task 7.

- [ ] **Step 1: Écrire `subscription-gate.action.ts`**

```ts
import { createServerFn } from "@tanstack/react-start";
import { Autumn } from "autumn-js";
import { z } from "zod";

import { env } from "@biume/env/server";
import { hasActiveOrTrialingSubscription } from "#/server/billing/subscription-gate";

const getOrganizationSubscriptionGateSchema = z.object({
  organizationId: z.string().min(1),
});

export const getOrganizationSubscriptionGateFn = createServerFn({ method: "GET" })
  .validator(getOrganizationSubscriptionGateSchema)
  .handler(async ({ data }) => {
    try {
      const client = new Autumn({ secretKey: env.AUTUMN_SECRET_KEY });
      const customer = await client.customers.get({
        customerId: data.organizationId,
      });

      return {
        hasActiveOrTrialingSubscription: hasActiveOrTrialingSubscription(
          customer.subscriptions,
        ),
      };
    } catch (error) {
      // Fail-open : une panne Autumn ne doit jamais bloquer tout le
      // dashboard.
      console.error(
        `[Autumn] Impossible de vérifier l'abonnement de ${data.organizationId}`,
        error,
      );
      return { hasActiveOrTrialingSubscription: true };
    }
  });
```

- [ ] **Step 2: Écrire le test du branchement dans `dashboard.tsx`**

Créer `apps/web/src/routes/dashboard.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import { resolveDashboardBillingRedirect } from "./dashboard";

describe("resolveDashboardBillingRedirect", () => {
  it("ne redirige pas avec un abonnement actif", () => {
    expect(resolveDashboardBillingRedirect("/dashboard/agenda", true)).toBeNull();
  });

  it("redirige vers /dashboard/settings sans abonnement", () => {
    expect(resolveDashboardBillingRedirect("/dashboard/agenda", false)).toBe(
      "/dashboard/settings",
    );
  });

  it("exempte /dashboard/settings", () => {
    expect(resolveDashboardBillingRedirect("/dashboard/settings", false)).toBeNull();
  });
});
```

- [ ] **Step 3: Vérifier que le test échoue**

Run: `cd apps/web && bun run test -- routes/dashboard.test.ts`
Expected: FAIL — `resolveDashboardBillingRedirect` n'existe pas encore.

- [ ] **Step 4: Brancher la gate dans `dashboard.tsx`**

Ajouter l'import en haut du fichier, à côté des autres imports `#/...` :

```ts
import { getOrganizationSubscriptionGateFn } from "#/lib/api/actions/subscription-gate.action";
import { getBillingGateRedirectTarget } from "#/server/billing/subscription-gate";
```

Ajouter, juste après la déclaration de `getDashboardRedirectTarget` existante :

```ts
export const resolveDashboardBillingRedirect = getBillingGateRedirectTarget;
```

Modifier le `beforeLoad` pour ajouter la vérification après la résolution de `currentOrganization` et avant le `Promise.all` final :

```ts
  beforeLoad: async ({ location }) => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/signin" });
    }

    if (!session.session.activeOrganizationId) {
      throw redirect({ to: "/select-organization" });
    }

    const currentOrganization = await getCurrentOrganization().catch(
      () => null,
    );

    const redirectTarget = getDashboardRedirectTarget(
      session,
      currentOrganization,
    );

    if (redirectTarget) {
      throw redirect({ to: redirectTarget });
    }

    // `session.session.activeOrganizationId` est garanti non-null ici (le
    // premier throw plus haut couvre le cas contraire), contrairement à
    // `currentOrganization` qui reste `Organization | null` pour TypeScript
    // après le `.catch(() => null)` — utiliser l'org directement produirait
    // une erreur de type sans apporter d'info supplémentaire, puisque
    // `getDashboardRedirectTarget` a déjà vérifié qu'ils coïncident.
    const { hasActiveOrTrialingSubscription } =
      await getOrganizationSubscriptionGateFn({
        data: { organizationId: session.session.activeOrganizationId },
      });

    const billingRedirectTarget = resolveDashboardBillingRedirect(
      location.pathname,
      hasActiveOrTrialingSubscription,
    );

    if (billingRedirectTarget) {
      throw redirect({
        to: billingRedirectTarget,
        search: { tab: "billing", blocked: true },
      });
    }

    const [organizations, sidebarDefaultOpen] = await Promise.all([
      getOrganizations(),
      getSidebarDefaultOpen(),
    ]);

    return { session, organizations, sidebarDefaultOpen };
  },
```

- [ ] **Step 5: Vérifier que le test passe**

Run: `cd apps/web && bun run test -- routes/dashboard.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Vérifier la compilation**

Run: `cd apps/web && bun run check-types`
Expected: pas de nouvelle erreur. Le `search: { tab, blocked }` doit correspondre au schéma de recherche que Task 8 ajoute à `/dashboard/settings` — si `check-types` échoue sur ce point avant que Task 8 soit fait, c'est attendu ; refaire cette vérification après Task 8.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/api/actions/subscription-gate.action.ts apps/web/src/routes/dashboard.tsx apps/web/src/routes/dashboard.test.ts
git commit -m "feat(billing): bloquer /dashboard sans abonnement actif ou à l'essai"
```

---

### Task 7: Brancher la même gate dans `dashboard_.reports_.$id_.edit.tsx`

**Files:**
- Modify: `apps/web/src/routes/dashboard_.reports_.$id_.edit.tsx`

**Interfaces:**
- Consumes: `resolveDashboardBillingRedirect` (exporté par `dashboard.tsx`, Task 6), `getOrganizationSubscriptionGateFn` (Task 6).
- Produces: rien de nouveau.

Cette route sort du layout `dashboard.tsx` (préfixe `dashboard_`), donc son `beforeLoad` ne bénéficie pas de la vérification ajoutée en Task 6 — elle doit la répéter.

- [ ] **Step 1: Ajouter les imports**

```ts
import { getOrganizationSubscriptionGateFn } from "#/lib/api/actions/subscription-gate.action";
import { getDashboardRedirectTarget, resolveDashboardBillingRedirect } from "./dashboard";
```

(remplace l'import existant `import { getDashboardRedirectTarget } from "./dashboard";`)

- [ ] **Step 2: Étendre le `beforeLoad`**

Remplacer :

```ts
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/signin" });
    }

    if (!session.session.activeOrganizationId) {
      throw redirect({ to: "/select-organization" });
    }

    const currentOrganization = await getCurrentOrganization().catch(
      () => null,
    );
    const redirectTarget = getDashboardRedirectTarget(
      session,
      currentOrganization,
    );

    if (redirectTarget) {
      throw redirect({ to: redirectTarget });
    }

    return { org: currentOrganization };
  },
```

par :

```ts
  beforeLoad: async ({ location }) => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/signin" });
    }

    if (!session.session.activeOrganizationId) {
      throw redirect({ to: "/select-organization" });
    }

    const currentOrganization = await getCurrentOrganization().catch(
      () => null,
    );
    const redirectTarget = getDashboardRedirectTarget(
      session,
      currentOrganization,
    );

    if (redirectTarget) {
      throw redirect({ to: redirectTarget });
    }

    // Même remarque que dans `dashboard.tsx` : `activeOrganizationId` est
    // sûr ici, `currentOrganization` reste nullable pour TypeScript.
    const { hasActiveOrTrialingSubscription } =
      await getOrganizationSubscriptionGateFn({
        data: { organizationId: session.session.activeOrganizationId },
      });

    const billingRedirectTarget = resolveDashboardBillingRedirect(
      location.pathname,
      hasActiveOrTrialingSubscription,
    );

    if (billingRedirectTarget) {
      throw redirect({
        to: billingRedirectTarget,
        search: { tab: "billing", blocked: true },
      });
    }

    return { org: currentOrganization };
  },
```

- [ ] **Step 3: Vérifier la compilation**

Run: `cd apps/web && bun run check-types`
Expected: pas de nouvelle erreur (à refaire après Task 8 si le schéma de recherche de `/dashboard/settings` n'existe pas encore).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/routes/dashboard_.reports_.$id_.edit.tsx
git commit -m "feat(billing): appliquer la même gate d'abonnement à l'édition de rapport"
```

---

### Task 8: Search params `tab`/`blocked` sur `/dashboard/settings`

**Files:**
- Modify: `apps/web/src/routes/dashboard/settings.tsx`

**Interfaces:**
- Consumes: rien de nouveau.
- Produces: `Route.useSearch()` typé `{ tab?: "organization" | "notifications" | "billing"; blocked?: boolean }` — consommé par Task 9 (bannière dans `BillingTab`) et par les redirections de Task 6/7.

- [ ] **Step 1: Ajouter le schéma de recherche**

Après `type SettingsTabId = "organization" | "notifications" | "billing";`, ajouter :

```ts
const settingsSearchSchema = z.object({
  tab: z.enum(["organization", "notifications", "billing"]).optional(),
  blocked: z.boolean().optional(),
});
```

- [ ] **Step 2: Déclarer `validateSearch` sur la route**

Dans `createFileRoute("/dashboard/settings")({...})`, ajouter la clé `validateSearch` :

```ts
export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Paramètres | Biume" },
      {
        name: "description",
        content: "Gérez les paramètres de votre espace Biume.",
      },
    ],
  }),
  validateSearch: settingsSearchSchema,
  ssr: true,
  loader: async () => {
    const [session, organization] = await Promise.all([
      getSession(),
      getOrganizationSettings(),
    ]);

    return { session, organization };
  },
  component: SettingsPage,
});
```

- [ ] **Step 3: Initialiser `activeTab` depuis la recherche**

Remplacer :

```ts
function SettingsPage() {
  const router = useRouter();
  const { session, organization } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<SettingsTabId>("organization");
```

par :

```ts
function SettingsPage() {
  const router = useRouter();
  const { session, organization } = Route.useLoaderData();
  const search = Route.useSearch();
  const [activeTab, setActiveTab] = useState<SettingsTabId>(
    search.tab ?? "organization",
  );
```

- [ ] **Step 4: Passer `blocked` à `BillingTab`**

Remplacer :

```ts
            {activeTab === "billing" ? (
              <BillingTab
                attach={attach}
                customer={customer}
                updateSubscription={updateSubscription}
              />
            ) : null}
```

par :

```ts
            {activeTab === "billing" ? (
              <BillingTab
                attach={attach}
                customer={customer}
                updateSubscription={updateSubscription}
                blocked={search.blocked ?? false}
              />
            ) : null}
```

- [ ] **Step 5: Vérifier la compilation**

Run: `cd apps/web && bun run check-types`
Expected: erreur attendue sur la prop `blocked` manquante dans la signature de `BillingTab` — résolue par Task 9. Si ce fichier est traité isolément, vérifier au moins qu'il n'y a pas d'erreur sur `validateSearch`/`Route.useSearch()`.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/routes/dashboard/settings.tsx
git commit -m "feat(billing): lire les search params tab/blocked sur /dashboard/settings"
```

---

### Task 9: Sélecteur de plan mensuel/annuel + bannière de blocage dans `BillingTab`

**Files:**
- Modify: `apps/web/src/routes/dashboard/settings.tsx:712-885` (fonction `BillingTab`)

**Interfaces:**
- Consumes: `autumnPlanIds` (déjà importé), `search.blocked` (Task 8).
- Produces: `BillingTab` accepte désormais une prop `blocked: boolean`.

- [ ] **Step 1: Remplacer la signature et l'état de `BillingTab`**

Remplacer :

```ts
function BillingTab({
  attach,
  customer,
  updateSubscription,
}: {
  attach: ReturnType<typeof useCustomer>["attach"];
  customer: ReturnType<typeof useCustomer>["data"];
  updateSubscription: ReturnType<typeof useCustomer>["updateSubscription"];
}) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const activeSubscription = customer?.subscriptions?.find((subscription) =>
    ["active", "trialing"].includes(subscription.status),
  );
  const subscriptionStatus = getSubscriptionStatus(activeSubscription);

  async function handleUpgrade() {
    try {
      setIsUpgrading(true);
      await attach({
        planId: autumnPlanIds.allInclusiveYearly,
        successUrl: `${window.location.origin}/dashboard/settings?tab=billing`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'ouvrir la mise à niveau.",
      );
    } finally {
      setIsUpgrading(false);
    }
  }
```

par :

```ts
const billingPlans = [
  {
    id: autumnPlanIds.allInclusiveMonthly,
    label: "Mensuel",
    priceLabel: "29,99 € / mois",
  },
  {
    id: autumnPlanIds.allInclusiveYearly,
    label: "Annuel",
    priceLabel: "299,88 € / an",
  },
] as const;

function BillingTab({
  attach,
  customer,
  updateSubscription,
  blocked,
}: {
  attach: ReturnType<typeof useCustomer>["attach"];
  customer: ReturnType<typeof useCustomer>["data"];
  updateSubscription: ReturnType<typeof useCustomer>["updateSubscription"];
  blocked: boolean;
}) {
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const activeSubscription = customer?.subscriptions?.find((subscription) =>
    ["active", "trialing"].includes(subscription.status),
  );
  const subscriptionStatus = getSubscriptionStatus(activeSubscription);

  async function handleAttach(planId: string) {
    try {
      setPendingPlanId(planId);
      await attach({
        planId,
        successUrl: `${window.location.origin}/dashboard/settings?tab=billing`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'ouvrir la mise à niveau.",
      );
    } finally {
      setPendingPlanId(null);
    }
  }
```

- [ ] **Step 2: Mettre à jour le reste du corps de la fonction**

Remplacer chaque référence à `isUpgrading`/`handleUpgrade` restante. Le bloc de boutons actuel :

```ts
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => void handleUpgrade()}
            disabled={isUpgrading}
            className="h-10 active:scale-[0.98]"
          >
            {isUpgrading ? "Ouverture..." : "Mettre à niveau"}
            {isUpgrading ? (
              <LoaderCircle
                className="size-4 animate-spin"
                data-icon="inline-end"
              />
            ) : (
              <Sparkles className="size-4" data-icon="inline-end" />
            )}
          </Button>
          {activeSubscription ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleCancelSubscription()}
              disabled={isCancelling}
              className="h-10 active:scale-[0.98]"
            >
              {isCancelling ? "Annulation..." : "Annuler en fin de période"}
              {isCancelling ? (
                <LoaderCircle
                  className="size-4 animate-spin"
                  data-icon="inline-end"
                />
              ) : null}
            </Button>
          ) : null}
        </div>
```

devient :

```ts
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {billingPlans.map((plan) => {
            const isCurrentPlan = activeSubscription?.planId === plan.id;
            const isPending = pendingPlanId === plan.id;

            return (
              <Button
                key={plan.id}
                type="button"
                variant={isCurrentPlan ? "outline" : "default"}
                onClick={() => void handleAttach(plan.id)}
                disabled={pendingPlanId !== null || isCurrentPlan}
                className="h-auto flex-col items-start gap-1 py-3 active:scale-[0.98]"
              >
                <span className="flex w-full items-center justify-between gap-2 text-sm font-semibold">
                  {plan.label}
                  {isCurrentPlan ? <CheckCircle2 className="size-4" /> : null}
                </span>
                <span className="text-xs font-normal text-slate-500">
                  {isPending ? "Ouverture..." : plan.priceLabel}
                </span>
              </Button>
            );
          })}
        </div>

        {activeSubscription ? (
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleCancelSubscription()}
              disabled={isCancelling}
              className="h-10 active:scale-[0.98]"
            >
              {isCancelling ? "Annulation..." : "Annuler en fin de période"}
              {isCancelling ? (
                <LoaderCircle
                  className="size-4 animate-spin"
                  data-icon="inline-end"
                />
              ) : null}
            </Button>
          </div>
        ) : null}
```

- [ ] **Step 3: Ajouter la bannière de blocage**

Juste avant le `<Panel>` principal (avant `<div className="grid gap-5">`'s premier enfant), insérer :

```ts
      {blocked ? (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
        >
          Votre période d'essai est terminée. Choisissez un plan ci-dessous
          pour continuer à utiliser Biume.
        </div>
      ) : null}
```

(à placer juste après le premier `return (` du composant `BillingTab`, avant le `<div className="grid gap-5">`)

- [ ] **Step 4: Vérifier la compilation**

Run: `cd apps/web && bun run check-types`
Expected: pas d'erreur.

- [ ] **Step 5: Tester manuellement**

Run: `cd apps/web && bun run dev`
Ouvrir `/dashboard/settings?tab=billing&blocked=true` (connecté avec une session existante) et vérifier : la bannière s'affiche, l'onglet Facturation est actif d'entrée, les deux boutons de plan sont cliquables indépendamment.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/routes/dashboard/settings.tsx
git commit -m "feat(billing): sélecteur mensuel/annuel et bannière d'essai expiré"
```

---

### Task 10: Script de backfill des organisations existantes

**Files:**
- Create: `apps/web/scripts/backfill-autumn-trials.ts`

**Interfaces:**
- Consumes: `startOrganizationTrial`, `StartOrganizationTrialDeps` (Task 2), `createProductionStartTrialDeps` (Task 4), `hasActiveOrTrialingSubscription` (Task 3), `db` (`@biume/db`), schémas `organization`/`member`/`user` (`@biume/db/schema/index`).
- Produces: script exécutable en CLI, aucune interface consommée ailleurs.

- [ ] **Step 1: Écrire le script**

```ts
/**
 * Backfill ponctuel : attache le plan mensuel (avec un nouvel essai de 15
 * jours) à toute organisation qui n'a aujourd'hui aucun abonnement Autumn
 * actif ou à l'essai — nécessaire avant d'activer le blocage dur du
 * dashboard, faute de quoi ces organisations seraient bloquées
 * immédiatement.
 *
 * Usage : bun run apps/web/scripts/backfill-autumn-trials.ts
 */
import { Autumn } from "autumn-js";
import { eq } from "drizzle-orm";

import { env } from "@biume/env/server";
import { db } from "../src/lib/utils/db";
import { member, organization } from "@biume/db/schema/index";
import { hasActiveOrTrialingSubscription } from "../src/server/billing/subscription-gate";
import { startOrganizationTrial } from "../src/server/billing/start-trial";
import { createProductionStartTrialDeps } from "../src/server/billing/start-trial.deps";

const client = new Autumn({ secretKey: env.AUTUMN_SECRET_KEY });
const deps = createProductionStartTrialDeps();

const organizations = await db.query.organization.findMany();

let started = 0;
let skipped = 0;
let failed = 0;

for (const org of organizations) {
  try {
    const customer = await client.customers.get({ customerId: org.id });

    if (hasActiveOrTrialingSubscription(customer.subscriptions)) {
      skipped += 1;
      continue;
    }
  } catch {
    // Customer inexistant côté Autumn : à traiter comme "sans abonnement".
  }

  const owner = await db.query.member.findFirst({
    where: eq(member.organizationId, org.id),
    with: { user: true },
  });

  if (!owner?.user?.email) {
    console.warn(`[backfill] ${org.id} (${org.name}) : aucun propriétaire avec email, ignorée`);
    failed += 1;
    continue;
  }

  try {
    await startOrganizationTrial(deps, {
      organizationId: org.id,
      organizationName: org.name,
      ownerEmail: owner.user.email,
      ownerUserId: owner.user.id,
    });
    started += 1;
    console.log(`[backfill] essai démarré pour ${org.id} (${org.name})`);
  } catch (error) {
    failed += 1;
    console.error(`[backfill] échec pour ${org.id} (${org.name})`, error);
  }
}

console.log(`[backfill] terminé : ${started} démarrés, ${skipped} déjà couverts, ${failed} échecs`);
```

- [ ] **Step 2: Vérifier la compilation**

Run: `cd apps/web && bun run check-types`
Expected: pas de nouvelle erreur.

- [ ] **Step 3: Dry-run manuel contre un environnement de test**

Exécuter contre une base de développement/staging (jamais directement contre la prod sans revue) :

Run: `cd apps/web && bun run scripts/backfill-autumn-trials.ts`
Expected: le résumé final (`X démarrés, Y déjà couverts, Z échecs`) correspond aux organisations connues de l'environnement ; relancer une seconde fois doit donner `0 démarrés, N déjà couverts` (idempotence).

- [ ] **Step 4: Commit**

```bash
git add apps/web/scripts/backfill-autumn-trials.ts
git commit -m "feat(billing): script de backfill des essais Autumn pour les organisations existantes"
```

---

### Task 11: Vérification de bout en bout

**Files:** aucun nouveau fichier — vérification manuelle du parcours complet.

- [ ] **Step 1: Lancer la suite complète**

Run: `cd apps/web && bun run test && bun run check-types`
Expected: PASS intégral.

- [ ] **Step 2: Parcours manuel — nouvelle organisation**

Run: `cd apps/web && bun run dev`

1. Créer un compte, créer une organisation via `/create-organization`.
2. Vérifier dans les logs serveur qu'aucune erreur `[Autumn] Impossible de démarrer l'essai` n'apparaît.
3. Aller sur `/dashboard/settings?tab=billing` : le statut affiché doit être « Essai », le plan actif `all_inclusive_monthly`.
4. Naviguer vers `/dashboard/agenda` : accès normal (essai en cours).

- [ ] **Step 3: Parcours manuel — organisation sans abonnement (simulateur de blocage)**

Dans le dashboard Autumn (ou via `client.billing.cancelSubscription`/annulation manuelle sur l'organisation de test), retirer l'abonnement actif de l'organisation de test, puis :

1. Naviguer vers `/dashboard/agenda` : doit rediriger vers `/dashboard/settings?tab=billing&blocked=true` avec la bannière visible.
2. Vérifier que `/dashboard/settings` reste accessible directement (pas de boucle de redirection).
3. Cliquer sur un des deux boutons de plan : `attach()` doit se déclencher (ouverture Stripe si carte requise pour un plan hors essai, ou attach direct).

- [ ] **Step 4: Commit final (si des ajustements ont eu lieu pendant la vérification)**

```bash
git add -A
git commit -m "test(billing): vérifications finales du parcours d'essai et de blocage"
```
