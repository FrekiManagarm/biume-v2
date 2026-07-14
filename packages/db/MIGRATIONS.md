# Database migrations

## New or empty database

Run the normal migration command. Drizzle applies `0000_baseline`, then
`0001_report_owner_content`:

```sh
bun run db:migrate
```

## Existing database created before migration tracking

Do not run `db:migrate` directly against an existing schema: `0000_baseline`
contains the initial `CREATE` statements and would collide with its tables.

Use the guarded baseline operation below. It marks only `0000_baseline` as
already applied and then invokes the Drizzle migrator, which executes
`0001_report_owner_content`. It never marks `0001` in advance.

Preconditions:

1. Create a database backup or Neon branch and test the procedure there first.
2. Pause concurrent deployments and schema changes for the target database.
3. Point `DATABASE_URL` at the intended database. The script also reads
   `apps/web/.env`, matching `drizzle.config.ts`.
4. Confirm that this database predates `report_owner_content`; if that table or
   enum exists without a matching migration row, the operation refuses to run.

Run the read-only preflight:

```sh
bun --filter @biume/db db:baseline-existing --check
```

The preflight verifies all 22 tables against the generated
`0000_snapshot.json`: exact column names, PostgreSQL types, nullability,
pertinent defaults, primary keys, foreign keys (including update/delete
actions), unique constraints, declared indexes, and the ordered values of all
11 enums. The two documented legacy timestamp defaults are reported and are
the only allowed preflight exception; `--apply` normalizes them before writing
the baseline history row. The script also checks that owner-content objects are
absent and refuses unknown or hash-mismatched Drizzle history.

After reviewing the target and preflight output, apply the baseline and feature
migration during the maintenance window:

```sh
bun --filter @biume/db db:baseline-existing --apply --confirm-existing-schema
```

Never run `--apply` first against production. Execute both `--check` and
`--apply` on a fresh Neon branch cloned from the target, inspect the resulting
constraints and application behavior, then repeat the same guarded operation
during the production maintenance window.

The operation:

1. computes the exact SHA-256 hash and timestamp Drizzle uses for
   `0000_baseline`;
2. normalizes the legacy `reminder.createdAt` and `signatures.createdAt`
   defaults to `now()` when needed, so the skipped baseline is truthful;
3. creates `drizzle.__drizzle_migrations` only if needed;
4. inserts the `0000` history row without executing its SQL;
5. invokes Drizzle's migrator so only the pending `0001` runs;
6. verifies both the `0001` history row and `public.report_owner_content`.

The command is idempotent for the exact two-migration history. It refuses a
changed migration set, unknown history rows, mismatched hashes, a missing
baseline object, or partially applied owner-content objects. Resolve any such
state manually on a database branch before touching production.
