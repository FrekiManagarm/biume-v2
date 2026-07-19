import { describe, expect, it } from "vitest";
import {
  buildReportSectionStateRows,
  normalizeReportSectionStates,
} from "./report-domain";

describe("report section persistence", () => {
  it("builds one row for every canonical section", () => {
    expect(
      buildReportSectionStateRows("report-1", {
        clinical: "confirmed",
        anatomical: "not_applicable",
        recommendations: "needs_confirmation",
        notes: "empty",
      }),
    ).toEqual([
      { reportId: "report-1", section: "clinical", state: "confirmed" },
      {
        reportId: "report-1",
        section: "anatomical",
        state: "not_applicable",
      },
      {
        reportId: "report-1",
        section: "recommendations",
        state: "needs_confirmation",
      },
      { reportId: "report-1", section: "notes", state: "empty" },
    ]);
  });

  it("fills missing legacy rows with empty decisions", () => {
    expect(
      normalizeReportSectionStates([
        { section: "clinical", state: "confirmed" },
      ]),
    ).toEqual({
      clinical: "confirmed",
      anatomical: "empty",
      recommendations: "empty",
      notes: "empty",
    });
  });
});
