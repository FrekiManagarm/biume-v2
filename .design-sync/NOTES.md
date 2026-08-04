# design-sync notes — @biume/ui

## Repo facts
- `packages/ui` (`@biume/ui`) has no build step and no root package entry — components are consumed as source (shadcn/base-ui pattern) by `apps/web` and `apps/marketing` via subpath exports (`./components/*`, `./hooks/*`, `./lib/*`). The converter runs in **synth-entry mode**, scanning `src/components/*.tsx` directly. `.d.ts` contracts are weaker than a real build would give (no dist to type-check against).
- `packages/ui/node_modules` doesn't carry `react` (bun hoists to repo root) — always pass `--node-modules ./node_modules` (repo root), not the package's own.
- 61 source files export **337** PascalCase symbols total (compound shadcn components each export a family of parts, e.g. `dialog.tsx` → `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, ... 9 exports from one file). All 337 are legitimate component exports — 0 were filtered as non-component noise.
- Preview authoring is scoped to the **60 primary/parent components** (one per source file, minus `DirectionProvider`); the other ~277 sub-parts ship as functional floor cards, not individually authored, and are composed inside their parent's authored preview instead (per this skill's own composition guidance).
- `DirectionProvider` (from `direction.tsx`) is excluded from the component list entirely via `componentSrcMap: {"DirectionProvider": null}` — it's a pure context re-export (`@base-ui/react/direction-provider`), no visual output, not something a design agent would card.
- Primary-name corrections vs. naive kebab→PascalCase (filename → actual export used as the authored/primary name):
  - `chart.tsx` → **ChartContainer** (no bare `Chart` export)
  - `input-otp.tsx` → **InputOTP** (not `InputOtp`)
  - `resizable.tsx` → **ResizablePanelGroup** (no bare `Resizable`; `ResizablePanel`/`ResizableHandle` are children)
  - `sonner.tsx` → **Toaster** (the file re-exports sonner's `Toaster`, not `Sonner`)
- Docs matching found 0/337 (no `docs/` dir in the package) — all components landed in the single `general` group. No per-category grouping has been set up yet; could be improved later with `docsMap` stub files (`---\ncategory: <Group>\n---`) if the DS pane organization matters to the user.
- Styling: `packages/ui/src/styles/globals.css` — Tailwind v4 token theme (`@theme inline` + CSS custom properties), imports `tw-animate-css` and `shadcn/tailwind.css`. Uses `@import "tailwindcss" source(none)` (no content scanning of its own — consuming apps scan their own source, via `@source` directives in each app's own globals.css).

## Required pre-step: compile CSS before every build
`cfg.cssEntry` points at `.ds-generated/globals.compiled.css`, NOT the package's real `src/styles/globals.css`. The raw file's `@import "tailwindcss" source(none)`, `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"` are bare npm-package specifiers meant to be resolved by a bundler/PostCSS — copying it verbatim makes `package-validate.mjs` fail with 3× `[CSS_IMPORT_MISSING]`, and `source(none)` means Tailwind emits zero utility classes with no explicit content source.

**Before every `package-build.mjs` run (first sync and every re-sync), run:**
```sh
node .design-sync/scripts/compile-css.mjs
```
This script lives under `.design-sync/scripts/` — the durable, committed set — specifically so the skill's `cp -r <skill-base-dir>/... .ds-sync/` re-staging step (which wipes/repopulates `.ds-sync/` from the bundled skill files on every re-sync) never touches it. It does two things:
1. Runs `packages/ui/src/styles/globals.css` through PostCSS + `@tailwindcss/postcss`, with `source(none)` replaced by explicit `@source` directives over `packages/ui/src/{components,hooks,lib}/**/*.{ts,tsx}` — this is a standalone compile (no consuming app around to declare sources), so it only captures utility classes the DS's own component internals use, not classes a design agent's own composition code might invent.
2. Appends a `:root` block defining `--font-geist-sans`/`--font-geist-mono`. `packages/ui` references these via `@theme inline` but never defines them — every consuming app (checked `apps/marketing/app/globals.css`) supplies the identical literal system-font-stack (NOT a real Geist webfont — the name is misleading, it resolves to `ui-sans-serif, system-ui, ...` / `ui-monospace, ...`). Ported verbatim from the real host value rather than invented. If a future consuming app ever ships an actual Geist webfont instead, update this block and re-check `[FONT_MISSING]`.

Output: `packages/ui/.ds-generated/globals.compiled.css` (gitignored — regenerated every run, ~200KB).

Two other validate warnings confirmed non-issues, no action needed: `--accordion-panel-height` (set at runtime by the accordion primitive's own JS, inline style — expected absent from static CSS) and `--tw` (Tailwind internal engine variable, not a real DS token).

## Re-sync risks
- The primary-name corrections above (chart/input-otp/resizable/sonner) are config choices (`componentSrcMap`), not auto-detected — if `packages/ui` restructures these files, the mapping will need revisiting.
- No build step means the whole bundle depends on the repo's live `src/` at sync time — there's no dist artifact acting as a stable snapshot. A partial/WIP edit to a component at sync time ships as-is.
- Grouping is entirely flat (`general`) — if the user later wants Buttons/Forms/Overlays/etc. categories, that's a `docsDir`/`docsMap` authoring task, not yet done.
- The compiled CSS is a **standalone** compile scoped to `packages/ui`'s own source only. If a component's styling depends on a utility class that ONLY appears in a consuming app's usage of it (never written inside `packages/ui/src/` itself), that class won't be in the compiled output. Not observed so far, but worth remembering if a preview ever looks unstyled in a way the source doesn't explain.
- If `packages/ui` ever gains a real build step or a shipped Geist webfont, revisit both the `shape`/synth-entry setup and the hardcoded font-var block above.
