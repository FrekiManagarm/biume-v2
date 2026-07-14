import { neon } from "@neondatabase/serverless";
import { config as loadEnv } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { fileURLToPath } from "node:url";

type JournalEntry = {
  idx: number;
  when: number;
  tag: string;
};

type Journal = {
  entries: JournalEntry[];
};

type SnapshotColumn = {
  name: string;
  type: string;
  notNull: boolean;
};

type SnapshotTable = {
  columns: Record<string, SnapshotColumn>;
};

type SnapshotEnum = {
  values: string[];
};

type Snapshot = {
  tables: Record<string, SnapshotTable>;
  enums: Record<string, SnapshotEnum>;
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

function postgresTypeName(type: string) {
  if (type.endsWith("[]")) {
    return `_${type.slice(0, -2)}`;
  }

  return (
    {
      boolean: "bool",
      integer: "int4",
    }[type] ?? type
  );
}

function validateJournal(journal: Journal) {
  const tags = journal.entries.map((entry) => entry.tag);

  if (
    journal.entries.length !== 2 ||
    tags[0] !== "0000_baseline" ||
    tags[1] !== "0001_report_owner_content"
  ) {
    throw new Error(
      `Expected exactly 0000_baseline and 0001_report_owner_content; found ${tags.join(", ") || "none"}. Review this operation before applying a changed migration set.`,
    );
  }

  const [baseline, feature] = journal.entries;
  if (!baseline || !feature || baseline.when >= feature.when) {
    throw new Error("Migration journal timestamps are missing or out of order.");
  }

  return { baseline, feature };
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

  const [journal, baselineSnapshot, baselineSql, featureSql] =
    await Promise.all([
      Bun.file(journalPath).json() as Promise<Journal>,
      Bun.file(baselineSnapshotPath).json() as Promise<Snapshot>,
      Bun.file(`${migrationsFolder}/0000_baseline.sql`).text(),
      Bun.file(`${migrationsFolder}/0001_report_owner_content.sql`).text(),
    ]);

  const { baseline, feature } = validateJournal(journal);
  const baselineHash = migrationHash(baselineSql);
  const featureHash = migrationHash(featureSql);
  const knownMigrations = new Map([
    [baseline.when, baselineHash],
    [feature.when, featureHash],
  ]);

  const sql = neon(databaseUrl);
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
  const [migrationTable] = (await sql`
    select to_regclass('drizzle.__drizzle_migrations')::text as name
  `) as Array<{ name: string | null }>;

  const actualTables = new Set(tableRows.map((row) => row.name));
  const actualEnums = new Set(enumRows.map((row) => row.name));
  const missingTables = Object.keys(baselineSnapshot.tables).filter(
    (table) => !actualTables.has(table),
  );
  const missingEnums = Object.keys(baselineSnapshot.enums).filter(
    (enumName) => !actualEnums.has(enumName),
  );

  if (missingTables.length > 0 || missingEnums.length > 0) {
    throw new Error(
      `Existing schema does not match the baseline. Missing tables: ${missingTables.join(", ") || "none"}. Missing enums: ${missingEnums.join(", ") || "none"}.`,
    );
  }

  const columnsByTable = Map.groupBy(
    columnRows,
    (column) => column.table_name,
  );
  const schemaMismatches: string[] = [];

  for (const [tableName, table] of Object.entries(baselineSnapshot.tables)) {
    const actualColumns = columnsByTable.get(tableName) ?? [];
    const actualByName = new Map(
      actualColumns.map((column) => [column.column_name, column]),
    );
    const expectedNames = new Set(Object.keys(table.columns));

    for (const column of Object.values(table.columns)) {
      const actual = actualByName.get(column.name);
      if (!actual) {
        schemaMismatches.push(`${tableName}.${column.name} is missing`);
        continue;
      }

      const expectedType = postgresTypeName(column.type);
      if (actual.udt_name !== expectedType) {
        schemaMismatches.push(
          `${tableName}.${column.name} has type ${actual.udt_name}, expected ${expectedType}`,
        );
      }

      if ((actual.is_nullable === "NO") !== column.notNull) {
        schemaMismatches.push(
          `${tableName}.${column.name} nullability does not match the baseline`,
        );
      }
    }

    for (const actual of actualColumns) {
      if (!expectedNames.has(actual.column_name)) {
        schemaMismatches.push(
          `${tableName}.${actual.column_name} is not present in the baseline`,
        );
      }
    }
  }

  const enumValuesByName = Map.groupBy(
    enumValueRows,
    (row) => row.enum_name,
  );
  for (const [enumName, expected] of Object.entries(
    baselineSnapshot.enums,
  )) {
    const actual = (enumValuesByName.get(enumName) ?? []).map(
      (row) => row.enum_value,
    );
    if (actual.join("\u0000") !== expected.values.join("\u0000")) {
      schemaMismatches.push(`${enumName} values do not match the baseline`);
    }
  }

  if (schemaMismatches.length > 0) {
    throw new Error(
      `Existing schema differs from 0000_baseline: ${schemaMismatches.slice(0, 20).join("; ")}${schemaMismatches.length > 20 ? `; and ${schemaMismatches.length - 20} more` : ""}.`,
    );
  }

  const temporalDefaultMismatches = [
    ["public.reminder", "createdAt"],
    ["public.signatures", "createdAt"],
  ].filter(([tableName, columnName]) => {
    const column = (columnsByTable.get(tableName ?? "") ?? []).find(
      (candidate) => candidate.column_name === columnName,
    );
    return column?.column_default?.replaceAll(" ", "").toLowerCase() !== "now()";
  });

  const featureTableExists = actualTables.has("public.report_owner_content");
  const featureEnumExists = actualEnums.has(
    "public.report_owner_content_source_kind",
  );
  let history: MigrationRow[] = [];

  if (migrationTable?.name) {
    history = (await sql`
      select hash, created_at
      from drizzle.__drizzle_migrations
      order by created_at asc
    `) as MigrationRow[];
    validateKnownHistory(history, knownMigrations);
  }

  const baselineRecorded = history.some(
    (row) => Number(row.created_at) === baseline.when,
  );
  const featureRecorded = history.some(
    (row) => Number(row.created_at) === feature.when,
  );

  if (featureRecorded && !baselineRecorded) {
    throw new Error(
      "0001 is recorded without 0000_baseline; manual recovery is required.",
    );
  }

  if (featureRecorded && (!featureTableExists || !featureEnumExists)) {
    throw new Error(
      "0001 is recorded but its table or enum is missing; manual recovery is required.",
    );
  }

  if (!featureRecorded && (featureTableExists || featureEnumExists)) {
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

  if (featureRecorded) {
    console.log("0000 and 0001 are already recorded and present; no action needed.");
    return;
  }

  console.log(
    `Preflight passed: ${Object.keys(baselineSnapshot.tables).length} tables, ${columnRows.filter((column) => baselineSnapshot.tables[column.table_name]).length} columns, and ${Object.keys(baselineSnapshot.enums).length} enums match 0000_baseline.`,
  );
  if (temporalDefaultMismatches.length > 0) {
    console.log(
      `${temporalDefaultMismatches.length} legacy createdAt default(s) will be normalized to now() by --apply.`,
    );
  }

  if (checkOnly) {
    console.log(
      baselineRecorded
        ? "0000_baseline is already recorded; 0001 is ready to migrate."
        : "0000_baseline is not recorded; --apply will record it before running 0001.",
    );
    return;
  }

  if (!baselineRecorded) {
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

  const featureApplied = finalHistory.some(
    (row) => Number(row.created_at) === feature.when,
  );
  if (!ownerTable?.name || !featureApplied) {
    throw new Error(
      "Migration finished without a verified 0001 history row and owner-content table.",
    );
  }

  console.log(
    "Reconciled temporal defaults, recorded 0000_baseline, applied 0001_report_owner_content, and verified the resulting table and migration history.",
  );
}

await main();
