import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { buildAtomicReportUpdateStatement } from "./report-update.persistence";

describe("atomic report update statement", () => {
  it("gates every destructive replacement behind the optimistic update CTE", () => {
    const statement = buildAtomicReportUpdateStatement({
      organizationId: "org-1",
      reportId: "report-1",
      expectedRevision: 4,
      title: "Rapport",
      consultationReason: "Suivi",
      patientId: "pet-1",
      appointmentId: null,
      notes: "Notes",
      status: "draft",
      updatedAt: new Date("2026-07-19T09:00:00.000Z"),
      sectionStates: [
        { reportId: "report-1", section: "clinical", state: "confirmed" },
      ],
      removedOwnerSources: [
        { sourceKind: "observation", sourceId: "obs-old" },
      ],
      anatomicalRows: [
        {
          id: "obs-1",
          type: "observation",
          advancedReportId: "report-1",
          notes: "Raideur",
          anatomicalPartId: "part-1",
          laterality: "left",
          severity: 2,
          observationType: "dynamic",
        },
      ],
      recommendationRows: [
        {
          id: "rec-1",
          advancedReportId: "report-1",
          recommendation: "Repos",
        },
      ],
    });
    const { sql, params } = new PgDialect().sqlToQuery(statement);

    expect(sql).toContain('WITH "updated_report" AS');
    expect(sql).toContain('"revision" = "revision" + 1');
    expect(sql).toContain('AND "revision" =');
    expect(sql).toContain('AND "createdBy" =');
    expect(sql).toContain("FROM \"updated_report\"");
    expect(sql).toContain("EXISTS (SELECT 1 FROM \"updated_report\")");
    expect(sql).toContain('SELECT "id", "revision" FROM "updated_report"');
    expect(params).toContain(4);
  });
});
