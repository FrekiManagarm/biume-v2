import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, test } from "vitest";
import {
  reportOwnerContent,
  reportOwnerContentSourceKind,
} from "./reportOwnerContent";

describe("reportOwnerContent", () => {
  test("has the required columns", () => {
    const config = getTableConfig(reportOwnerContent);
    expect(config.name).toBe("report_owner_content");
    expect(config.columns.map((column) => column.name)).toEqual(
      expect.arrayContaining([
        "id",
        "report_id",
        "source_kind",
        "source_id",
        "owner_text",
        "source_fingerprint",
        "created_at",
        "updated_at",
      ]),
    );
  });

  test("has the named unique source index", () => {
    const config = getTableConfig(reportOwnerContent);
    const sourceIndex = config.indexes.find(
      (index) => index.config.name === "report_owner_content_source_unique",
    );

    expect(sourceIndex?.config.unique).toBe(true);
    expect(
      sourceIndex?.config.columns.map((column) =>
        "name" in column ? column.name : undefined,
      ),
    ).toEqual(["report_id", "source_kind", "source_id"]);
  });

  test("cascades deletion through the report foreign key", () => {
    const config = getTableConfig(reportOwnerContent);
    const reportForeignKey = config.foreignKeys.find((foreignKey) =>
      foreignKey
        .reference()
        .columns.some((column) => column.name === "report_id"),
    );
    const reference = reportForeignKey?.reference();

    expect(reference?.columns.map((column) => column.name)).toEqual([
      "report_id",
    ]);
    expect(reference?.foreignColumns.map((column) => column.name)).toEqual([
      "id",
    ]);
    expect(
      reference ? getTableConfig(reference.foreignTable).name : undefined,
    ).toBe("advancedReport");
    expect(reportForeignKey?.onDelete).toBe("cascade");
  });

  test("declares every supported owner content source kind", () => {
    expect(reportOwnerContentSourceKind.enumValues).toEqual([
      "consultationReason",
      "observation",
      "anatomicalIssue",
      "recommendation",
      "notes",
    ]);
  });
});
