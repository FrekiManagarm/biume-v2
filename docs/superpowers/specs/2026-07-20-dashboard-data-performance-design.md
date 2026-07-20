# Dashboard Data Performance Design

## Goal

Make dashboard navigation feel immediate by reusing hydrated TanStack Query data
while keeping operational data acceptably fresh.

## Scope

The dashboard layout and its overview, agenda, clients, patients, reports,
report detail, report edit, settings, and assistant routes are in scope. Auth
guards remain route-level server checks and are not cached as client data.

## Data flow

Each reusable server read is represented by a `queryOptions` factory with a
stable, hierarchical key and a route-appropriate freshness policy. Route
loaders call `queryClient.ensureQueryData` so SSR, intent preloads, and normal
navigations share one cache entry. Components consume the same options through
`useSuspenseQuery`.

The dashboard sidebar uses intent preload links. The router retains intent
preloading and gives preload results a non-zero freshness window, avoiding a
second loader run when a user clicks a link they have just hovered or focused.

## Freshness policy

| Data | staleTime | gcTime |
| --- | ---: | ---: |
| Dashboard layout: organizations and sidebar preference | 5 minutes | 30 minutes |
| Overview and agenda | 30 seconds | 10 minutes |
| Clients, patients, animals, report lists, and report details | 60 seconds | 10 minutes |
| Settings session and organization data | 60 seconds | 10 minutes |

Mutations continue to invalidate the matching query-key prefix. Organization
switching performs a full dashboard reload, so no cache from the previous
organization can be displayed.

## Route changes

- Keep `beforeLoad` in the dashboard layout for session and organization
  validation only.
- Convert all dashboard data loaders to `ensureQueryData`, including the
  already-prefetched overview and layout queries.
- Add missing query-option factories for dashboard layout and settings data.
- Update route components that read loader data to use their shared suspense
  query options instead.
- Leave the assistant route unchanged because it has no route-level server
  read.

## Verification

Add focused loader tests for the cache operations and query-option policy.
Run those tests, formatting checks, and the production web build.
