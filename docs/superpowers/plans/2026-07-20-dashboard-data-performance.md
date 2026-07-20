# Dashboard Data Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every dashboard data route hydrate from a warmed TanStack Query cache while retaining the agreed freshness windows.

**Architecture:** Reusable query-option factories own their keys, server functions, and freshness policy. Dashboard loaders use `ensureQueryData` for SSR and intent-preload hydration, while route components read the exact same options through `useSuspenseQuery`. Auth remains in `beforeLoad`; it is not client-cached.

**Tech Stack:** TanStack Start, TanStack Router, TanStack Query v5, React, Vitest, Bun.

---

### Task 1: Establish shared cache policy

**Files:**
- Create: `apps/web/src/lib/api/queries/query-cache.ts`
- Create: `apps/web/src/lib/api/queries/query-cache.test.ts`
- Modify: `apps/web/src/integrations/tanstack-query/root-provider.tsx`
- Modify: `apps/web/src/router.tsx`

- [ ] **Step 1: Write the failing cache-policy test**

```ts
import { describe, expect, test } from "vitest";
import { dashboardCacheTimes } from "./query-cache";

test("keeps dashboard data fresh for its route-specific interval", () => {
  expect(dashboardCacheTimes.layout.staleTime).toBe(5 * 60 * 1_000);
  expect(dashboardCacheTimes.live.staleTime).toBe(30 * 1_000);
  expect(dashboardCacheTimes.entity.staleTime).toBe(60 * 1_000);
  expect(dashboardCacheTimes.entity.gcTime).toBe(10 * 60 * 1_000);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `bun --filter @biume/web test src/lib/api/queries/query-cache.test.ts`

Expected: FAIL because `./query-cache` does not exist.

- [ ] **Step 3: Add the policy and defaults**

```ts
export const dashboardCacheTimes = {
  layout: { staleTime: 5 * 60 * 1_000, gcTime: 30 * 60 * 1_000 },
  live: { staleTime: 30 * 1_000, gcTime: 10 * 60 * 1_000 },
  entity: { staleTime: 60 * 1_000, gcTime: 10 * 60 * 1_000 },
} as const;
```

Construct the root `QueryClient` with the entity policy as its query default.
Set `defaultPreloadStaleTime: 30_000` in `apps/web/src/router.tsx`; keep `defaultPreload: "intent"`.

- [ ] **Step 4: Run the test and formatting check**

Run: `bun --filter @biume/web test src/lib/api/queries/query-cache.test.ts && bunx prettier --check apps/web/src/lib/api/queries/query-cache.ts apps/web/src/lib/api/queries/query-cache.test.ts apps/web/src/integrations/tanstack-query/root-provider.tsx apps/web/src/router.tsx`

Expected: PASS; all four files are formatted.

### Task 2: Apply policy to query option factories

**Files:**
- Modify: `apps/web/src/lib/api/queries/appointments.query.ts`
- Modify: `apps/web/src/lib/api/queries/dashboard.query.ts`
- Modify: `apps/web/src/lib/api/queries/dashboard-agenda.query.ts`
- Modify: `apps/web/src/lib/api/queries/clients.query.ts`
- Modify: `apps/web/src/lib/api/queries/patients.query.ts`
- Modify: `apps/web/src/lib/api/queries/reports.query.ts`
- Modify: `apps/web/src/lib/api/queries/dashboard-layout.query.ts`
- Create: `apps/web/src/lib/api/queries/settings.query.ts`
- Create: `apps/web/src/lib/api/queries/settings.query.test.ts`

- [ ] **Step 1: Write the failing settings-query test**

```ts
import { expect, test, vi } from "vitest";
import { organizationSettingsQueryOptions } from "./settings.query";

test("uses a cacheable organization-settings query", () => {
  const options = organizationSettingsQueryOptions();
  expect(options.queryKey).toEqual(["organizations", "settings"]);
  expect(options.staleTime).toBe(60_000);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `bun --filter @biume/web test src/lib/api/queries/settings.query.test.ts`

Expected: FAIL because `settings.query.ts` does not exist.

- [ ] **Step 3: Implement the factory and freshness assignments**

```ts
export const organizationSettingsQueryOptions = () =>
  queryOptions({
    queryKey: ["organizations", "settings"] as const,
    queryFn: () => getOrganizationSettings(),
    ...dashboardCacheTimes.entity,
  });
```

Import `dashboardCacheTimes` in every existing factory. Spread `live` into the
overview, agenda-day, and appointments options; spread `layout` into
organizations and sidebar options; spread `entity` into clients, patients,
animals, reports, report detail, and organization settings.

- [ ] **Step 4: Run focused query tests**

Run: `bun --filter @biume/web test src/lib/api/queries/query-cache.test.ts src/lib/api/queries/settings.query.test.ts`

Expected: PASS.

### Task 3: Hydrate all dashboard route data through loaders

**Files:**
- Modify: `apps/web/src/routes/dashboard.tsx`
- Modify: `apps/web/src/routes/dashboard/index.tsx`
- Modify: `apps/web/src/routes/dashboard/agenda.tsx`
- Modify: `apps/web/src/routes/dashboard/clients.tsx`
- Modify: `apps/web/src/routes/dashboard/patients.tsx`
- Modify: `apps/web/src/routes/dashboard/reports.tsx`
- Modify: `apps/web/src/routes/dashboard/reports_.$id.tsx`
- Modify: `apps/web/src/routes/dashboard/settings.tsx`
- Modify: `apps/web/src/routes/dashboard_.reports_.$id_.edit.tsx`
- Modify: `apps/web/src/routes/-dashboard.test.tsx`
- Modify: `apps/web/src/routes/dashboard/-index.test.tsx`
- Create: `apps/web/src/routes/dashboard/-agenda.test.tsx`
- Create: `apps/web/src/routes/dashboard/-settings.test.tsx`

- [ ] **Step 1: Write failing loader tests for the extra route dependencies**

```ts
test("warms appointments and patients before agenda renders", async () => {
  await loader({ context: { queryClient: { ensureQueryData } } });
  expect(ensureQueryData).toHaveBeenCalledTimes(2);
});

test("warms organization settings before settings renders", async () => {
  await loader({ context: { queryClient: { ensureQueryData } } });
  expect(ensureQueryData).toHaveBeenCalledWith(
    organizationSettingsQueryOptions(),
  );
});
```

- [ ] **Step 2: Run loader tests and verify they fail**

Run: `bun --filter @biume/web test src/routes/dashboard/-agenda.test.tsx src/routes/dashboard/-settings.test.tsx`

Expected: FAIL because the agenda loader has one dependency and settings has no query loader.

- [ ] **Step 3: Use `ensureQueryData` consistently**

Replace the overview and layout `prefetchQuery` calls with these exact calls:

```ts
await context.queryClient.ensureQueryData(
  dashboardOverviewQueryOptions(deps.selectedDate),
);

await Promise.all([
  context.queryClient.ensureQueryData(organizationsQueryOptions()),
  context.queryClient.ensureQueryData(sidebarDefaultOpenQueryOptions()),
]);
```

The agenda loader must `Promise.all` its appointments and patients options.
Leave the existing clients, patients, reports, and report-detail ensure loaders
in place. Replace the report-editor prefetch loader with `ensureQueryData`.
In settings, loader-prefetch `organizationSettingsQueryOptions()` and consume it
with `useSuspenseQuery`; obtain the session from the dashboard parent route
context instead of calling `getSession` again.

- [ ] **Step 4: Run all dashboard loader tests**

Run: `bun --filter @biume/web test src/routes/-dashboard.test.tsx src/routes/dashboard/-index.test.tsx src/routes/dashboard/-agenda.test.tsx src/routes/dashboard/-settings.test.tsx`

Expected: PASS.

### Task 4: Verify mutation consistency and production behavior

**Files:**
- Modify: `apps/web/src/routes/dashboard/settings.tsx`
- Test: `apps/web/src/routes/dashboard/-settings.test.tsx`

- [ ] **Step 1: Write the failing invalidation test**

```ts
test("invalidates organization settings after a successful update", async () => {
  await onOrganizationUpdated();
  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: ["organizations"],
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `bun --filter @biume/web test src/routes/dashboard/-settings.test.tsx`

Expected: FAIL because settings currently only invalidates the router.

- [ ] **Step 3: Invalidate the matching query prefix after settings changes**

```ts
await queryClient.invalidateQueries({ queryKey: ["organizations"] });
await router.invalidate();
```

Keep the existing router invalidation after notification updates; this plan does
not introduce a cache-backed session query.

- [ ] **Step 4: Run final verification**

Run: `bun --filter @biume/web test src/lib/api/queries/query-cache.test.ts src/lib/api/queries/settings.query.test.ts src/routes/-dashboard.test.tsx src/routes/dashboard/-index.test.tsx src/routes/dashboard/-agenda.test.tsx src/routes/dashboard/-settings.test.tsx && bun --filter @biume/web build && git diff --check`

Expected: all selected tests pass, the production build exits 0, and the diff has no whitespace errors.
