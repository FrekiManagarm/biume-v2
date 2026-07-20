import { neon } from "@neondatabase/serverless";
import { config as loadEnv } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { fileURLToPath } from "node:url";
import {
  compareBaselineSchema,
  type ActualBaselineSchema,
  type BaselineSnapshot,
} from "./baseline-schema-compatibility";

export type JournalEntry = {
  idx: number;
  when: number;
  tag: string;
};

type Journal = {
  entries: JournalEntry[];
};

type MigrationRow = {
  hash: string;
  created_at: string | number;
};

type NameRow = {
  name: string;
};

type ColumnRow = {
  table_name: string;
  column_name: string;
  udt_name: string;
  is_nullable: "YES" | "NO";
  column_default: string | null;
};

type EnumValueRow = {
  enum_name: string;
  enum_value: string;
};

const migrationsFolder = fileURLToPath(
  new URL("../src/migrations", import.meta.url),
);
const journalPath = `${migrationsFolder}/meta/_journal.json`;
const baselineSnapshotPath = `${migrationsFolder}/meta/0000_snapshot.json`;

function printUsage() {
  console.log(`Usage:
  bun --filter @biume/db db:baseline-existing --check
  bun --filter @biume/db db:baseline-existing --apply --confirm-existing-schema

--check                    Run read-only compatibility checks.
--apply                    Record 0000_baseline and run pending migrations.
--confirm-existing-schema  Required acknowledgement for --apply.`);
}

function migrationHash(sql: string) {
  return new Bun.CryptoHasher("sha256").update(sql).digest("hex");
}

export function validateMigrationJournal(journal: Journal) {
  const [baseline, ownerContent, ...later] = journal.entries;
  if (
    baseline?.tag !== "0000_baseline" ||
    ownerContent?.tag !== "0001_report_owner_content"
  ) {
    throw new Error(
      "Expected migration history to start with 0000_baseline and 0001_report_owner_content.",
    );
  }
  const entries = [baseline, ownerContent, ...later];
  for (let index = 1; index < entries.length; index += 1) {
    if (entries[index - 1]!.when >= entries[index]!.when) {
      throw new Error("Migration journal timestamps are missing or out of order.");
    }
  }
  return entries;
}

export function requiresBaselineSchemaValidation(
  history: Array<Pick<MigrationRow, "created_at">>,
  baseline: JournalEntry,
) {
  return !history.some(
    (row) => Number(row.created_at) === baseline.when,
  );
}

function validateKnownHistory(
  history: MigrationRow[],
  knownMigrations: Map<number, string>,
) {
  for (const row of history) {
    const createdAt = Number(row.created_at);
    const expectedHash = knownMigrations.get(createdAt);

    if (!expectedHash) {
      throw new Error(
        `Unknown migration history row at created_at=${row.created_at}; refusing to alter migration state.`,
      );
    }

    if (row.hash !== expectedHash) {
      throw new Error(
        `Migration hash mismatch at created_at=${row.created_at}; refusing to alter migration state.`,
      );
    }
  }
}

async function main() {
  const args = new Set(Bun.argv.slice(2));

  if (args.has("--help")) {
    printUsage();
    return;
  }

  const checkOnly = args.has("--check");
  const apply = args.has("--apply");

  if (checkOnly === apply) {
    printUsage();
    throw new Error("Choose exactly one of --check or --apply.");
  }

  if (apply && !args.has("--confirm-existing-schema")) {
    throw new Error(
      "--apply requires --confirm-existing-schema after reviewing the documented preconditions.",
    );
  }

  loadEnv({
    path: fileURLToPath(new URL("../../../apps/web/.env", import.meta.url)),
    quiet: true,
  });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const journal = (await Bun.file(journalPath).json()) as Journal;
  const entries = validateMigrationJournal(journal);
  const [baselineSnapshot, migrationSql] = await Promise.all([
    Bun.file(baselineSnapshotPath).json() as Promise<BaselineSnapshot>,
    Promise.all(
      entries.map(async (entry) => ({
        entry,
        sql: await Bun.file(`${migrationsFolder}/${entry.tag}.sql`).text(),
      })),
    ),
  ]);
  const knownMigrations = new Map(
    migrationSql.map(({ entry, sql }) => [entry.when, migrationHash(sql)]),
  );
  const [baseline, ownerContent] = entries;

  const sql = neon(databaseUrl);
  const [migrationTable] = (await sql`
    select to_regclass('drizzle.__drizzle_migrations')::text as name
  `) as Array<{ name: string | null }>;
  let history: MigrationRow[] = [];

  if (migrationTable?.name) {
    history = (await sql`
      select hash, created_at
      from drizzle.__drizzle_migrations
      order by created_at asc
    `) as MigrationRow[];
    validateKnownHistory(history, knownMigrations);
  }

  const baselineSchemaValidationRequired =
    requiresBaselineSchemaValidation(history, baseline);
  const baselineRecorded = !baselineSchemaValidationRequired;

  const tableRows = (await sql`
    select schemaname || '.' || tablename as name
    from pg_catalog.pg_tables
    where schemaname = 'public'
  `) as NameRow[];
  const enumRows = (await sql`
    select namespace.nspname || '.' || type.typname as name
    from pg_catalog.pg_type as type
    inner join pg_catalog.pg_namespace as namespace
      on namespace.oid = type.typnamespace
    where namespace.nspname = 'public' and type.typtype = 'e'
  `) as NameRow[];
  const columnRows = (await sql`
    select
      table_schema || '.' || table_name as table_name,
      column_name,
      udt_name,
      is_nullable,
      column_default
    from information_schema.columns
    where table_schema = 'public'
  `) as ColumnRow[];
  const enumValueRows = (await sql`
    select
      namespace.nspname || '.' || type.typname as enum_name,
      value.enumlabel as enum_value
    from pg_catalog.pg_type as type
    inner join pg_catalog.pg_namespace as namespace
      on namespace.oid = type.typnamespace
    inner join pg_catalog.pg_enum as value
      on type.oid = value.enumtypid
    where namespace.nspname = 'public'
    order by value.enumsortorder
  `) as EnumValueRow[];
  const primaryKeyRows = (await sql`
    select
      namespace.nspname || '.' || table_class.relname as "tableName",
      constraint_row.conname as name,
      array_agg(attribute.attname order by key_column.ordinality) as columns
    from pg_catalog.pg_constraint as constraint_row
    inner join pg_catalog.pg_class as table_class on table_class.oid = constraint_row.conrelid
    inner join pg_catalog.pg_namespace as namespace on namespace.oid = table_class.relnamespace
    cross join lateral unnest(constraint_row.conkey) with ordinality as key_column(attnum, ordinality)
    inner join pg_catalog.pg_attribute as attribute
      on attribute.attrelid = constraint_row.conrelid and attribute.attnum = key_column.attnum
    where namespace.nspname = 'public' and constraint_row.contype = 'p'
    group by namespace.nspname, table_class.relname, constraint_row.conname
  `) as ActualBaselineSchema["primaryKeys"];
  const foreignKeyRows = (await sql`
    select
      source_namespace.nspname || '.' || source_table.relname as "tableName",
      constraint_row.conname as name,
      array_agg(source_attribute.attname order by source_key.ordinality) as columns,
      target_namespace.nspname || '.' || target_table.relname as "referencedTable",
      array_agg(target_attribute.attname order by source_key.ordinality) as "referencedColumns",
      case constraint_row.confdeltype when 'c' then 'cascade' when 'r' then 'restrict' when 'n' then 'set null' when 'd' then 'set default' else 'no action' end as "onDelete",
      case constraint_row.confupdtype when 'c' then 'cascade' when 'r' then 'restrict' when 'n' then 'set null' when 'd' then 'set default' else 'no action' end as "onUpdate"
    from pg_catalog.pg_constraint as constraint_row
    inner join pg_catalog.pg_class as source_table on source_table.oid = constraint_row.conrelid
    inner join pg_catalog.pg_namespace as source_namespace on source_namespace.oid = source_table.relnamespace
    inner join pg_catalog.pg_class as target_table on target_table.oid = constraint_row.confrelid
    inner join pg_catalog.pg_namespace as target_namespace on target_namespace.oid = target_table.relnamespace
    cross join lateral unnest(constraint_row.conkey) with ordinality as source_key(attnum, ordinality)
    inner join lateral unnest(constraint_row.confkey) with ordinality as target_key(attnum, ordinality)
      on target_key.ordinality = source_key.ordinality
    inner join pg_catalog.pg_attribute as source_attribute
      on source_attribute.attrelid = constraint_row.conrelid and source_attribute.attnum = source_key.attnum
    inner join pg_catalog.pg_attribute as target_attribute
      on target_attribute.attrelid = constraint_row.confrelid and target_attribute.attnum = target_key.attnum
    where source_namespace.nspname = 'public' and constraint_row.contype = 'f'
    group by source_namespace.nspname, source_table.relname, target_namespace.nspname, target_table.relname,
      constraint_row.conname, constraint_row.confdeltype, constraint_row.confupdtype
  `) as ActualBaselineSchema["foreignKeys"];
  const uniqueConstraintRows = (await sql`
    select
      namespace.nspname || '.' || table_class.relname as "tableName",
      constraint_row.conname as name,
      array_agg(attribute.attname order by key_column.ordinality) as columns,
      index_row.indnullsnotdistinct as "nullsNotDistinct"
    from pg_catalog.pg_constraint as constraint_row
    inner join pg_catalog.pg_class as table_class on table_class.oid = constraint_row.conrelid
    inner join pg_catalog.pg_namespace as namespace on namespace.oid = table_class.relnamespace
    inner join pg_catalog.pg_index as index_row on index_row.indexrelid = constraint_row.conindid
    cross join lateral unnest(constraint_row.conkey) with ordinality as key_column(attnum, ordinality)
    inner join pg_catalog.pg_attribute as attribute
      on attribute.attrelid = constraint_row.conrelid and attribute.attnum = key_column.attnum
    where namespace.nspname = 'public' and constraint_row.contype = 'u'
    group by namespace.nspname, table_class.relname, constraint_row.conname, index_row.indnullsnotdistinct
  `) as ActualBaselineSchema["uniqueConstraints"];
  const indexRows = (await sql`
    select
      namespace.nspname || '.' || table_class.relname as "tableName",
      index_class.relname as name,
      array_agg(pg_get_indexdef(index_row.indexrelid, key_position.ordinality::integer, true) order by key_position.ordinality) as columns,
      index_row.indisunique as unique
    from pg_catalog.pg_index as index_row
    inner join pg_catalog.pg_class as table_class on table_class.oid = index_row.indrelid
    inner join pg_catalog.pg_namespace as namespace on namespace.oid = table_class.relnamespace
    inner join pg_catalog.pg_class as index_class on index_class.oid = index_row.indexrelid
    cross join lateral generate_series(1, index_row.indnkeyatts) with ordinality as key_position(position, ordinality)
    where namespace.nspname = 'public'
    group by namespace.nspname, table_class.relname, index_class.relname, index_row.indisunique
  `) as ActualBaselineSchema["indexes"];
  const columnsByTable = Map.groupBy(columnRows, (column) => column.table_name);
  const actualTables = new Set(tableRows.map((row) => row.name));
  const actualEnums = new Set(enumRows.map((row) => row.name));
  if (baselineSchemaValidationRequired) {
    const schemaMismatches = compareBaselineSchema(
      baselineSnapshot,
      {
        tables: [...actualTables],
        columns: columnRows.map((column) => ({
          tableName: column.table_name,
          name: column.column_name,
          type: column.udt_name,
          notNull: column.is_nullable === "NO",
          defaultValue: column.column_default,
        })),
        enums: [...actualEnums],
        enumValues: enumValueRows.map((row) => ({
          enumName: row.enum_name,
          value: row.enum_value,
        })),
        primaryKeys: primaryKeyRows,
        foreignKeys: foreignKeyRows,
        uniqueConstraints: uniqueConstraintRows,
        indexes: indexRows,
      },
      {
        allowedDefaultMismatches: new Set([
          "public.reminder.createdAt",
          "public.signatures.createdAt",
        ]),
      },
    );

    if (schemaMismatches.length > 0) {
      throw new Error(
        `Existing schema differs from 0000_baseline: ${schemaMismatches.slice(0, 20).join("; ")}${schemaMismatches.length > 20 ? `; and ${schemaMismatches.length - 20} more` : ""}.`,
      );
    }
  }

  const temporalDefaultMismatches = [
    ["public.reminder", "createdAt"],
    ["public.signatures", "createdAt"],
  ].filter(([tableName, columnName]) => {
    const column = (columnsByTable.get(tableName ?? "") ?? []).find(
      (candidate) => candidate.column_name === columnName,
    );
    return (
      column?.column_default?.replaceAll(" ", "").toLowerCase() !== "now()"
    );
  });

  const ownerContentTableExists = actualTables.has("public.report_owner_content");
  const ownerContentEnumExists = actualEnums.has(
    "public.report_owner_content_source_kind",
  );
  const ownerContentRecorded = history.some(
    (row) => Number(row.created_at) === ownerContent.when,
  );

  if (ownerContentRecorded && !baselineRecorded) {
    throw new Error(
      "0001 is recorded without 0000_baseline; manual recovery is required.",
    );
  }

  if (
    ownerContentRecorded &&
    (!ownerContentTableExists || !ownerContentEnumExists)
  ) {
    throw new Error(
      "0001 is recorded but its table or enum is missing; manual recovery is required.",
    );
  }

  if (
    !ownerContentRecorded &&
    (ownerContentTableExists || ownerContentEnumExists)
  ) {
    throw new Error(
      "Owner-content objects already exist without a matching 0001 history row; refusing to baseline over an inconsistent state.",
    );
  }

  if (apply && temporalDefaultMismatches.length > 0) {
    await sql.transaction([
      sql`alter table public.reminder alter column "createdAt" set default now()`,
      sql`alter table public.signatures alter column "createdAt" set default now()`,
    ]);
    console.log(
      "Normalized reminder.createdAt and signatures.createdAt defaults to now().",
    );
  }

  console.log(
    baselineSchemaValidationRequired
      ? `Preflight passed: ${Object.keys(baselineSnapshot.tables).length} tables, ${columnRows.filter((column) => baselineSnapshot.tables[column.table_name]).length} columns, and ${Object.keys(baselineSnapshot.enums).length} enums match 0000_baseline.`
      : "0000_baseline is recorded; skipped the pre-baselining schema equality check.",
  );
  if (temporalDefaultMismatches.length > 0) {
    console.log(
      `${temporalDefaultMismatches.length} legacy createdAt default(s) will be normalized to now() by --apply.`,
    );
  }

  const recordedTimestamps = new Set(
    history.map((row) => Number(row.created_at)),
  );
  const pendingEntries = entries.filter(
    (entry) => !recordedTimestamps.has(entry.when),
  );

  if (checkOnly) {
    console.log(
      pendingEntries.length === 0
        ? "All journaled migrations are already recorded."
        : `${pendingEntries.length} migration(s) are ready to apply: ${pendingEntries
            .map((entry) => entry.tag)
            .join(", ")}.`,
    );
    return;
  }

  if (!baselineRecorded) {
    const baselineHash = migrationHash(migrationSql[0]!.sql);
    await sql.transaction([
      sql`create schema if not exists drizzle`,
      sql`create table if not exists drizzle.__drizzle_migrations (
        id serial primary key,
        hash text not null,
        created_at bigint
      )`,
      sql`insert into drizzle.__drizzle_migrations (hash, created_at)
        select ${baselineHash}, ${baseline.when}
        where not exists (
          select 1
          from drizzle.__drizzle_migrations
          where created_at = ${baseline.when}
        )`,
    ]);
  }

  const db = drizzle(sql);
  await migrate(db, { migrationsFolder });

  const [ownerTable] = (await sql`
    select to_regclass('public.report_owner_content')::text as name
  `) as Array<{ name: string | null }>;
  const finalHistory = (await sql`
    select hash, created_at
    from drizzle.__drizzle_migrations
    order by created_at asc
  `) as MigrationRow[];
  validateKnownHistory(finalHistory, knownMigrations);

  const finalTimestamps = new Set(
    finalHistory.map((row) => Number(row.created_at)),
  );
  const missingEntries = entries.filter(
    (entry) => !finalTimestamps.has(entry.when),
  );
  if (!ownerTable?.name || missingEntries.length > 0) {
    throw new Error(
      `Migration finished with missing history: ${missingEntries
        .map((entry) => entry.tag)
        .join(", ") || "owner-content table"}.`,
    );
  }

  console.log(
    `Reconciled the baseline and verified ${entries.length} journaled migrations.`,
  );
}

if (import.meta.main) {
  await main();
}
