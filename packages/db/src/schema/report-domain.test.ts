import { getTableColumns, getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { advancedReport } from "./advancedReport/advancedReport";
import { reportSectionState } from "./advancedReport/reportSectionState";
import { reportSharedVersion } from "./advancedReport/reportSharedVersion";
import { pets } from "./pets";

describe("report domain schema", () => {
  it("persists a report revision", () => {
    expect(getTableColumns(advancedReport).revision.notNull).toBe(true);
    expect(getTableColumns(advancedReport).revision.default).toBe(1);
  });

  it("stores section decisions separately from report content", () => {
    expect(getTableName(reportSectionState)).toBe("report_section_state");
    expect(Object.keys(getTableColumns(reportSectionState))).toEqual([
      "reportId",
      "section",
      "state",
      "updatedAt",
    ]);
  });

  it("stores an immutable snapshot against one report revision", () => {
    expect(getTableName(reportSharedVersion)).toBe("report_shared_version");
    expect(getTableColumns(reportSharedVersion).snapshot.notNull).toBe(true);
    expect(getTableColumns(reportSharedVersion).reportRevision.notNull).toBe(true);
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
