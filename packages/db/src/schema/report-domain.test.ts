import { getTableColumns, getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { advancedReport } from "./advancedReport/advancedReport";
import {
  reportSection,
  reportSectionDecision,
  reportSectionState,
} from "./advancedReport/reportSectionState";
import { reportSharedVersion } from "./advancedReport/reportSharedVersion";
import { pets } from "./pets";

describe("report domain schema", () => {
  it("persists a report revision", () => {
    expect(getTableColumns(advancedReport).revision.notNull).toBe(true);
    expect(getTableColumns(advancedReport).revision.default).toBe(1);
  });

  it("stores a tenant-scoped quick-create idempotency key and fingerprint", () => {
    const columns = getTableColumns(advancedReport);
    expect(columns.clientRequestId.notNull).toBe(false);
    expect(columns.quickRequestFingerprint.notNull).toBe(false);

    const index = getTableConfig(advancedReport).indexes.find(
      (candidate) =>
        candidate.config.name === "advanced_report_quick_request_unique",
    );
    expect(index?.config.unique).toBe(true);
    expect(
      index?.config.columns.map((column) =>
        "name" in column ? column.name : undefined,
      ),
    ).toEqual(["createdBy", "client_request_id"]);
  });

  it("stores section decisions separately from report content", () => {
    expect(getTableName(reportSectionState)).toBe("report_section_state");
    expect(
      new Set(Object.keys(getTableColumns(reportSectionState))),
    ).toEqual(new Set(["reportId", "section", "state", "updatedAt"]));
  });

  it("declares exact report section and decision enums", () => {
    expect(reportSection.enumValues).toEqual([
      "clinical",
      "anatomical",
      "recommendations",
      "notes",
    ]);
    expect(reportSectionDecision.enumName).toBe("report_section_decision");
    expect(reportSectionDecision.enumValues).toEqual([
      "empty",
      "proposed",
      "needs_confirmation",
      "confirmed",
      "not_applicable",
    ]);
  });

  it("uniquely identifies one section decision per report", () => {
    const [primaryKey] = getTableConfig(reportSectionState).primaryKeys;

    expect(primaryKey?.columns.map((column) => column.name)).toEqual([
      "report_id",
      "section",
    ]);
  });

  it("cascades section decisions through their report foreign key", () => {
    const config = getTableConfig(reportSectionState);
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

  it("stores an immutable snapshot against one report revision", () => {
    expect(getTableName(reportSharedVersion)).toBe("report_shared_version");
    expect(getTableColumns(reportSharedVersion).snapshot.notNull).toBe(true);
    expect(getTableColumns(reportSharedVersion).reportRevision.notNull).toBe(true);
  });

  it("uniquely identifies one shared snapshot per report revision", () => {
    const config = getTableConfig(reportSharedVersion);
    const revisionIndex = config.indexes.find(
      (index) => index.config.name === "report_shared_version_revision_unique",
    );

    expect(revisionIndex?.config.unique).toBe(true);
    expect(
      revisionIndex?.config.columns.map((column) =>
        "name" in column ? column.name : undefined,
      ),
    ).toEqual(["report_id", "report_revision"]);
  });

  it("cascades shared snapshots through report and organization foreign keys", () => {
    const config = getTableConfig(reportSharedVersion);
    const references = new Map(
      config.foreignKeys.map((foreignKey) => {
        const reference = foreignKey.reference();
        return [
          reference.columns[0]?.name,
          {
            foreignColumn: reference.foreignColumns[0]?.name,
            foreignTable: getTableConfig(reference.foreignTable).name,
            onDelete: foreignKey.onDelete,
          },
        ];
      }),
    );

    expect(references.get("report_id")).toEqual({
      foreignColumn: "id",
      foreignTable: "advancedReport",
      onDelete: "cascade",
    });
    expect(references.get("organization_id")).toEqual({
      foreignColumn: "id",
      foreignTable: "organizations",
      onDelete: "cascade",
    });
  });

  it("allows a quick-created animal to omit profile details", () => {
    const columns = getTableColumns(pets);
    expect(columns.weight.notNull).toBe(false);
    expect(columns.height.notNull).toBe(false);
    expect(columns.breed.notNull).toBe(false);
    expect(columns.birthDate.notNull).toBe(false);
    expect(columns.gender.notNull).toBe(false);
  });
});
