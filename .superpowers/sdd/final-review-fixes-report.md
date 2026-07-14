# Final review fixes report

## Scope

One-pass remediation of every Critical and Important issue from the final
report-owner-sheet review. No production database was contacted and no anatomy
geometry, path, transform, view box, ratio, or laterality data was changed.

## Fixes

1. **Secured `/api/vulgarisation`.** The endpoint now requires a Better Auth
   session and active organization, accepts only `reportId`, `sourceKind`, and
   `sourceId`, loads the report through a tenant predicate, rebuilds the source
   from persisted report data, and sends only canonical server text/context to
   the model. Client messages and `sourceContext` are ignored. Request bodies,
   source length, output tokens, and per-user/organization request frequency are
   capped. There is no established server-side Autumn entitlement check in this
   repository, so no new entitlement abstraction was invented.
2. **Canonical anatomical fingerprints.** Both professional fallback text and
   structured fingerprint context use `anatomicalPart?.name ?? region`, matching
   persisted-source reconstruction. Tests cover save then ready validation.
3. **No silent loss on `Passer`.** A dirty owner draft opens an explicit
   confirmation; cancel keeps the draft and explicit confirmation skips without
   saving.
4. **Responsive Sheets.** Preparation and preview remain viewport-width at 390
   and 768 pixels and switch to 32rem only at the `lg` (1024px) breakpoint.
   Reduced-motion transition overrides are present.
5. **Navigation semantics.** Each professional section now has a distinct
   `Vide`, `En cours`, or green `Complet` state, a rendered item count, and
   progress derived from completion rather than nonzero count. Owner status is
   absent for sections without an applicable owner source, so they cannot be
   labelled `Prêt`. Exact professional jargon is unchanged.
6. **Migration preflight.** The existing-schema comparator now checks pertinent
   defaults, primary keys, foreign-key targets and update/delete actions, unique
   constraints, declared indexes, columns, and enums before a baseline history
   row can be written. Fixture tests cover each mismatch category. The Neon
   branch-first procedure is documented; production was not accessed.

Small review recommendations were also included: all report child IDs now use
`z.string().min(1)`, and owner Sheets explicitly disable transitions under
reduced motion.

## Verification

- `bun --filter @biume/web test` — 24 files, 130 tests passed.
- `bun --filter @biume/db test` — 3 files, 12 tests passed.
- `bun x tsc --noEmit -p packages/db/tsconfig.json` — passed.
- `bun run check-types` — passed for every workspace package exposing the
  script (UI and emails; Turbo reports the other packages without a script).
- `bun --filter @biume/web build` — exit 0; Vite client, Vite SSR, Nitro public,
  and Nitro server builds completed. Prerender then logged the known missing
  local environment variables and skipped authenticated dashboard pages.
- `bun x tsc --noEmit -p apps/web/tsconfig.json` — still reports only historical
  errors outside this diff: duplicate cat data key, Base UI date-picker
  `asChild`, client/patient relation types, and form-schema typing. No changed
  report-owner file appears in the diagnostics.

## Remaining operational risk

- The guarded baseline operation must still be exercised on a fresh Neon branch
  cloned from the target before production, as documented in
  `packages/db/MIGRATIONS.md`.
- The in-memory generation limiter is intentionally best-effort per server
  instance. It materially reduces accidental abuse without adding infrastructure
  or a dependency; a shared limiter can replace it if deployment-scale abuse
  controls become a separate requirement.
