export type BaselineSnapshot = {
  tables: Record<
    string,
    {
      name: string;
      columns: Record<
        string,
        {
          name: string;
          type: string;
          notNull: boolean;
          primaryKey?: boolean;
          default?: unknown;
        }
      >;
      indexes: Record<
        string,
        {
          name: string;
          columns: Array<string | { expression: string }>;
          isUnique?: boolean;
        }
      >;
      foreignKeys: Record<
        string,
        {
          name: string;
          tableTo: string;
          columnsFrom: string[];
          columnsTo: string[];
          onDelete?: string;
          onUpdate?: string;
        }
      >;
      compositePrimaryKeys: Record<string, { name: string; columns: string[] }>;
      uniqueConstraints: Record<
        string,
        {
          name: string;
          columns: string[];
          nullsNotDistinct?: boolean;
        }
      >;
    }
  >;
  enums: Record<string, { values: string[] }>;
};

export type ActualBaselineSchema = {
  tables: string[];
  columns: Array<{
    tableName: string;
    name: string;
    type: string;
    notNull: boolean;
    defaultValue: string | null;
  }>;
  enums: string[];
  enumValues: Array<{ enumName: string; value: string }>;
  primaryKeys: Array<{ tableName: string; name: string; columns: string[] }>;
  foreignKeys: Array<{
    tableName: string;
    name: string;
    columns: string[];
    referencedTable: string;
    referencedColumns: string[];
    onDelete: string;
    onUpdate: string;
  }>;
  uniqueConstraints: Array<{
    tableName: string;
    name: string;
    columns: string[];
    nullsNotDistinct: boolean;
  }>;
  indexes: Array<{
    tableName: string;
    name: string;
    columns: string[];
    unique: boolean;
  }>;
};

function postgresTypeName(type: string) {
  if (type.endsWith("[]")) return `_${type.slice(0, -2)}`;
  return (
    ({ boolean: "bool", integer: "int4" } as Record<string, string>)[type] ??
    type
  );
}

function normalizeAction(action?: string) {
  return (action ?? "no action").toLowerCase().replaceAll("_", " ");
}

function normalizeDefault(value: unknown) {
  if (value === undefined || value === null) return null;
  let normalized = String(value).trim().replaceAll(" ", "").toLowerCase();
  while (normalized.startsWith("(") && normalized.endsWith(")")) {
    normalized = normalized.slice(1, -1);
  }
  normalized = normalized.replace(/::[a-z0-9_\.\[\]"]+$/i, "");
  return normalized;
}

function sameColumns(left: string[], right: string[]) {
  return left.join("\u0000") === right.join("\u0000");
}

export function compareBaselineSchema(
  snapshot: BaselineSnapshot,
  actual: ActualBaselineSchema,
  options: { allowedDefaultMismatches?: Set<string> } = {},
) {
  const mismatches: string[] = [];
  const actualTables = new Set(actual.tables);
  const actualEnums = new Set(actual.enums);

  for (const tableName of Object.keys(snapshot.tables)) {
    if (!actualTables.has(tableName))
      mismatches.push(`${tableName} table is missing`);
  }
  for (const enumName of Object.keys(snapshot.enums)) {
    if (!actualEnums.has(enumName))
      mismatches.push(`${enumName} enum is missing`);
  }

  for (const [tableName, table] of Object.entries(snapshot.tables)) {
    const actualColumns = actual.columns.filter(
      (column) => column.tableName === tableName,
    );
    const actualByName = new Map(
      actualColumns.map((column) => [column.name, column]),
    );
    const expectedNames = new Set(
      Object.values(table.columns).map((column) => column.name),
    );
    for (const column of Object.values(table.columns)) {
      const found = actualByName.get(column.name);
      if (!found) {
        mismatches.push(`${tableName}.${column.name} column is missing`);
        continue;
      }
      if (found.type !== postgresTypeName(column.type)) {
        mismatches.push(
          `${tableName}.${column.name} type is ${found.type}, expected ${postgresTypeName(column.type)}`,
        );
      }
      if (found.notNull !== column.notNull) {
        mismatches.push(
          `${tableName}.${column.name} nullability does not match`,
        );
      }
      const key = `${tableName}.${column.name}`;
      if (
        !options.allowedDefaultMismatches?.has(key) &&
        normalizeDefault(found.defaultValue) !==
          normalizeDefault(column.default)
      ) {
        mismatches.push(`${key} default does not match the baseline`);
      }
    }
    for (const found of actualColumns) {
      if (!expectedNames.has(found.name))
        mismatches.push(
          `${tableName}.${found.name} is not present in the baseline`,
        );
    }

    const expectedPrimaryColumns = [
      ...Object.values(table.columns)
        .filter((column) => column.primaryKey)
        .map((column) => column.name),
      ...Object.values(table.compositePrimaryKeys).flatMap(
        (key) => key.columns,
      ),
    ];
    const primaryKey = actual.primaryKeys.find(
      (key) => key.tableName === tableName,
    );
    if (
      !primaryKey ||
      !sameColumns(primaryKey.columns, expectedPrimaryColumns)
    ) {
      mismatches.push(`${tableName} primary key does not match the baseline`);
    }

    for (const expected of Object.values(table.foreignKeys)) {
      const found = actual.foreignKeys.find(
        (key) => key.tableName === tableName && key.name === expected.name,
      );
      const referencedTable = `public.${expected.tableTo}`;
      if (
        !found ||
        !sameColumns(found.columns, expected.columnsFrom) ||
        found.referencedTable !== referencedTable ||
        !sameColumns(found.referencedColumns, expected.columnsTo) ||
        normalizeAction(found.onDelete) !==
          normalizeAction(expected.onDelete) ||
        normalizeAction(found.onUpdate) !== normalizeAction(expected.onUpdate)
      ) {
        mismatches.push(
          `${tableName}.${expected.name} foreign key or actions do not match the baseline`,
        );
      }
    }

    for (const expected of Object.values(table.uniqueConstraints)) {
      const found = actual.uniqueConstraints.find(
        (constraint) =>
          constraint.tableName === tableName &&
          constraint.name === expected.name,
      );
      if (
        !found ||
        !sameColumns(found.columns, expected.columns) ||
        found.nullsNotDistinct !== Boolean(expected.nullsNotDistinct)
      ) {
        mismatches.push(
          `${tableName}.${expected.name} unique constraint does not match the baseline`,
        );
      }
    }

    for (const expected of Object.values(table.indexes)) {
      const expectedColumns = expected.columns.map((column) =>
        typeof column === "string" ? column : column.expression,
      );
      const found = actual.indexes.find(
        (index) =>
          index.tableName === tableName && index.name === expected.name,
      );
      if (
        !found ||
        !sameColumns(found.columns, expectedColumns) ||
        found.unique !== Boolean(expected.isUnique)
      ) {
        mismatches.push(
          `${tableName}.${expected.name} index does not match the baseline`,
        );
      }
    }
  }

  for (const [enumName, expected] of Object.entries(snapshot.enums)) {
    const values = actual.enumValues
      .filter((row) => row.enumName === enumName)
      .map((row) => row.value);
    if (!sameColumns(values, expected.values)) {
      mismatches.push(`${enumName} values do not match the baseline`);
    }
  }

  return mismatches;
}
