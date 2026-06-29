# AGENTS.md

Instructions for AI agents working in this repository.

## Project Overview

Biume is a Bun workspace monorepo using Turbo.

- `apps/web`: main application, built with TanStack Start, React, TanStack Router, TanStack Query, Tailwind CSS v4, and Shadcn-style UI.
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

This repo currently has scripts that call framework CLIs internally, such as `vite` for TanStack Start and `next` for the marketing app. Run them through Bun scripts rather than replacing them:

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

- Use TanStack Start and TanStack Router conventions for routes.
- Add routes under `apps/web/src/routes`.
- Do not edit `apps/web/src/routeTree.gen.ts` manually. Regenerate routes with `bun --filter @biume/web generate-routes` when needed.
- Use TanStack Query for server/client data fetching state where it fits existing patterns.
- Keep route-level components focused. Move reusable UI into shared components.
- Prefer path imports already configured by the app, such as `#/*` inside `apps/web`.

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

- Prefer existing TanStack Start server patterns in `apps/web`.
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
- For route changes, regenerate route types if required and verify the relevant app builds or type-checks.
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
- Do not manually edit generated route trees, lockfile internals, or build output.
- If dependency changes are required, update `bun.lock` by running Bun rather than editing it by hand.

## User Preferences

The project owner primarily uses:

- TanStack Start for frontend application work.
- Tailwind CSS and Shadcn-style components for UX/UI.
- Bun as the default JavaScript runtime and package manager.

When in doubt, follow those preferences and the existing repository patterns.
