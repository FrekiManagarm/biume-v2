import { describe, expect, test } from "vitest";
import { compareBaselineSchema } from "./baseline-schema-compatibility";

const snapshot = {
  tables: {
    "public.child": {
      name: "child",
      columns: {
        id: { name: "id", type: "text", primaryKey: true, notNull: true },
        parentId: {
          name: "parent_id",
          type: "text",
          primaryKey: false,
          notNull: true,
        },
        status: {
          name: "status",
          type: "text",
          primaryKey: false,
          notNull: true,
          default: "'draft'",
        },
      },
      indexes: {
        child_status_idx: {
          name: "child_status_idx",
          columns: [
            {
              expression: "status",
              isExpression: false,
              asc: true,
              nulls: "last",
            },
          ],
          isUnique: false,
        },
      },
      foreignKeys: {
        child_parent_fk: {
          name: "child_parent_fk",
          tableFrom: "child",
          tableTo: "parent",
          columnsFrom: ["parent_id"],
          columnsTo: ["id"],
          onDelete: "cascade",
          onUpdate: "no action",
        },
      },
      compositePrimaryKeys: {},
      uniqueConstraints: {
        child_parent_unique: {
          name: "child_parent_unique",
          columns: ["parent_id", "status"],
          nullsNotDistinct: false,
        },
      },
    },
  },
  enums: {},
};

const actual = {
  tables: ["public.child"],
  columns: [
    {
      tableName: "public.child",
      name: "id",
      type: "text",
      notNull: true,
      defaultValue: null,
    },
    {
      tableName: "public.child",
      name: "parent_id",
      type: "text",
      notNull: true,
      defaultValue: null,
    },
    {
      tableName: "public.child",
      name: "status",
      type: "text",
      notNull: true,
      defaultValue: "'draft'::text",
    },
  ],
  enums: [],
  enumValues: [],
  primaryKeys: [
    { tableName: "public.child", name: "child_pkey", columns: ["id"] },
  ],
  foreignKeys: [
    {
      tableName: "public.child",
      name: "child_parent_fk",
      columns: ["parent_id"],
      referencedTable: "public.parent",
      referencedColumns: ["id"],
      onDelete: "cascade",
      onUpdate: "no action",
    },
  ],
  uniqueConstraints: [
    {
      tableName: "public.child",
      name: "child_parent_unique",
      columns: ["parent_id", "status"],
      nullsNotDistinct: false,
    },
  ],
  indexes: [
    {
      tableName: "public.child",
      name: "child_status_idx",
      columns: ["status"],
      unique: false,
    },
  ],
};

describe("compareBaselineSchema", () => {
  test("accepts matching primary keys, cascades, uniques, indexes and defaults", () => {
    expect(compareBaselineSchema(snapshot, actual)).toEqual([]);
  });

  test.each([
    ["primaryKeys", [], "primary key"],
    [
      "foreignKeys",
      [{ ...actual.foreignKeys[0]!, onDelete: "restrict" }],
      "foreign key",
    ],
    ["uniqueConstraints", [], "unique constraint"],
    ["indexes", [], "index"],
    [
      "columns",
      actual.columns.map((column) =>
        column.name === "status"
          ? { ...column, defaultValue: "'finalized'::text" }
          : column,
      ),
      "default",
    ],
  ] as const)("rejects a %s mismatch", (key, value, message) => {
    const mismatches = compareBaselineSchema(snapshot, {
      ...actual,
      [key]: value,
    });
    expect(mismatches.some((mismatch) => mismatch.includes(message))).toBe(
      true,
    );
  });

  test("accepts a table with no expected and no actual primary key", () => {
    const withoutPrimaryKey = {
      ...snapshot,
      tables: {
        "public.child": {
          ...snapshot.tables["public.child"],
          columns: {
            ...snapshot.tables["public.child"].columns,
            id: {
              ...snapshot.tables["public.child"].columns.id,
              primaryKey: false,
            },
          },
        },
      },
    };

    expect(
      compareBaselineSchema(withoutPrimaryKey, {
        ...actual,
        primaryKeys: [],
      }),
    ).toEqual([]);
  });

  test("rejects an unexpected primary key when the baseline expects none", () => {
    const withoutPrimaryKey = {
      ...snapshot,
      tables: {
        "public.child": {
          ...snapshot.tables["public.child"],
          columns: {
            ...snapshot.tables["public.child"].columns,
            id: {
              ...snapshot.tables["public.child"].columns.id,
              primaryKey: false,
            },
          },
        },
      },
    };

    expect(
      compareBaselineSchema(withoutPrimaryKey, actual).some((mismatch) =>
        mismatch.includes("primary key"),
      ),
    ).toBe(true);
  });
});
