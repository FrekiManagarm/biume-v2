# AGENTS.md

Instructions for AI agents working in this repository.

## Project Overview

Biume is a Bun workspace monorepo using Turbo.

- `apps/web`: main application, built with Next.js 16 (App Router), React, TanStack Query, Tailwind CSS v4, and Shadcn-style UI.
- `apps/marketing`: marketing site, built with Next.js.
- `packages/ui`: shared UI components and Tailwind globals.
- `packages/db`: Drizzle schema, migrations, and database utilities.
- `packages/auth`: authentication helpers and Better Auth integration.
- `packages/env`: typed environment configuration.
- `packages/config`: shared TypeScript/config package.

Use existing workspace packages and local patterns before adding new dependencies or abstractions.

## Default Tooling

Default to Bun.

- Use `bun install` for dependency installation.
- Use `bun run <script>` instead of `npm run`, `yarn`, or `pnpm`.
- Use `bun <file>` instead of `node <file>` or `ts-node <file>`.
- Use `bun test` when adding Bun-native tests.
- Keep the existing package manager as Bun. Do not add npm, Yarn, or pnpm lockfiles.

This repo currently has scripts that call framework CLIs internally, such as `next` for both `apps/web` and `apps/marketing`, and `vitest` (which still runs on Vite) for `apps/web` tests. Run them through Bun scripts rather than replacing them:

- `bun run dev`
- `bun run build`
- `bun run check-types`
- `bun run dev:web`
- `bun run dev:marketing`

For package-scoped work, prefer Turbo filters through the existing root scripts or Bun workspace commands. Examples:

- `bun run dev:web`
- `bun run db:generate`
- `bun run db:migrate`
- `bun --filter @biume/ui check-types`

## Frontend Guidelines

The primary product frontend is `apps/web`.

- Add pages under `apps/web/app`, following Next.js App Router conventions.
- Use TanStack Query for client-side data fetching state where it fits existing patterns. TanStack Router is gone; only the framework-agnostic TanStack packages remain — `react-query`, `react-form`, `react-table`, `react-store`, and `match-sorter-utils`. Treat them like any other library, not as a routing layer.
- Keep route-level components focused. Move reusable UI into shared components.
- Prefer path imports already configured by the app, such as `#/*` inside `apps/web`.

### The three-file pattern for `apps/web` data access

Every resource that reads or writes data follows the same three-file split. Follow it for new resources; don't introduce a fourth shape.

- `functions/*.function.ts` — pure server logic (Drizzle queries, business rules). Starts with `import "server-only"` so a stray client import fails the build instead of shipping `db` to the browser.
- `lib/api/actions/*.mutations.ts` — starts with `"use server"`. **Mutations only.** This directive applies to the whole file: every export becomes a public network entry point, so nothing that isn't meant to be callable from outside goes in this file.
- `lib/api/actions/*.action.ts` — the public contract client code imports. It re-exports types and wraps reads for the client. **Every import from a `*.function.ts` file in this file must stay in type position** (`import type`, or `typeof import(...)`) — a value import here pulls Drizzle and other server-only dependencies into the client bundle, and no test catches that regression.

A server read (a Server Component, a route handler, a job) **imports the function directly from `functions/*.function.ts`, never the `*.action.ts` wrapper.** That wrapper calls `internalGet`, which does a `fetch` on a relative URL — that only resolves in a browser, where a relative URL completes implicitly against `location`. Called from Node, it throws `TypeError: Failed to parse URL`.

Mutations follow the same three-file shape, but with a different contract: they return `{ success, error }` and don't throw. A Next.js Server Action strips error messages down to a generic string in production, and this codebase has many `throw new Error("<message for the practitioner>")` calls that would otherwise become unreadable. Wrap mutation logic with the `toActionResult` helper (`lib/api/actions/action-result.ts`) rather than reinventing this.

**A transport failure still rejects, though** — network errors, and Next's own control-flow throws (`redirect()`, `notFound()`) aren't converted to `{ success: false }`. Any mutation called from a handler that doesn't `await` it (a fire-and-forget click handler, for instance) needs its own `try/catch`; otherwise that rejection is silent and the UI is left stuck with no feedback.

### Dashboard pages and billing

Every dashboard page's Server Component calls `requireActiveBilling()` (from `#/lib/dashboard-billing-guard`) as its first statement. A Next.js layout is not re-run on client-side navigation between the pages it wraps, unlike a page — so the layout's own billing check is not enough to catch a practitioner whose subscription lapses mid-session. A test fails if a dashboard page is missing this call.

### `cache()` from React

`cache()` only memoizes inside a Server Component's request scope — not in a route handler, and not under Vitest. It also compares arguments **by reference**: passing an object literal defeats memoization even when two call sites want the same result, because each literal is a distinct reference. A memoized function should take a primitive argument (e.g. an id string), not an object, so repeated calls in the same request actually share one cache entry. See `lib/api/actions/subscription-gate.action.ts` for a worked example.

The marketing site is `apps/marketing`.

- Keep Next.js-specific code inside `apps/marketing`.
- Do not move marketing-only layout, metadata, or page code into the product app.

## UI and Styling

Use Tailwind CSS v4 and the existing Shadcn-style component system.

- Prefer shared components from `@biume/ui/components`.
- Add broadly reusable UI to `packages/ui/src/components`.
- Add app-specific UI close to the app that owns it.
- Use `lucide-react` icons for buttons and common UI actions when an icon exists.
- Follow the aliases in `packages/ui/components.json`.
- Keep styling consistent with existing Tailwind variables and globals.
- Avoid one-off design systems, new styling libraries, or large visual rewrites unless explicitly requested.

When building product interfaces, prioritize dense, clear, operational UI over marketing-style composition. Use cards for repeated items or framed tools, not as the default layout wrapper for every section.

## API, Server, and Runtime

- Prefer existing Next.js App Router server patterns in `apps/web` — Server Components, Server Actions, and route handlers under `app/api`. See the three-file pattern above for how data access is structured.
- Do not introduce Express.
- Prefer Bun-native APIs for standalone scripts when practical:
  - `Bun.file` over `node:fs` helpers for simple file reads/writes.
  - `Bun.$` over `execa`.
  - `Bun.serve()` for new standalone Bun servers.
- Bun loads `.env` automatically; do not add `dotenv` to new code unless the existing package already requires it.

## Database and Environment

Database code lives in `packages/db`.

- Use Drizzle ORM and the existing schema layout under `packages/db/src/schema`.
- Keep schema exports centralized through the existing schema index patterns.
- Run database scripts through the root scripts when possible:
  - `bun run db:generate`
  - `bun run db:migrate`
  - `bun run db:push`
  - `bun run db:studio`

Environment code lives in `packages/env`.

- Add new environment variables through the typed env package.
- Do not read process env ad hoc across the app when a typed env helper exists.
- Never commit secrets or real production credentials.

## Testing and Verification

Use the smallest verification command that covers the change.

- For type-level or cross-package changes, run `bun run check-types`.
- For package tests, run the package's existing test script with Bun, for example `bun --filter @biume/db test`.
- For page or route changes in `apps/web`, verify the app builds or type-checks; regenerate `apps/web/openapi.json` (`bun --filter @biume/web emit-openapi`) if the mobile-facing `/api/mobile/v1` contract changed.
- For UI changes, run the relevant dev server when useful and inspect the result.

Do not claim tests passed unless you actually ran them.

## Code Style

- Use TypeScript and ESM.
- Preserve existing formatting and import style.
- Keep changes scoped to the requested behavior.
- Avoid unrelated refactors.
- Avoid broad dependency additions. If a dependency is necessary, choose one that fits the existing stack.
- Prefer explicit, readable code over clever abstractions.
- Add comments only when they clarify non-obvious behavior.

## Git and Generated Files

- The worktree may already contain user changes. Do not revert or overwrite unrelated changes.
- Do not delete generated files or public assets unless the task explicitly requires it.
- Do not manually edit lockfile internals or build output (`.next/**`, generated OpenAPI types).
- If dependency changes are required, update `bun.lock` by running Bun rather than editing it by hand.

## User Preferences

The project owner primarily uses:

- Next.js (App Router) for frontend application work.
- Tailwind CSS and Shadcn-style components for UX/UI.
- Bun as the default JavaScript runtime and package manager.

When in doubt, follow those preferences and the existing repository patterns.
