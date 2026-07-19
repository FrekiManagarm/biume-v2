import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const source = readFileSync(
  new URL("./reports.function.ts", import.meta.url),
  "utf8",
);
const updateSource = source.slice(
  source.indexOf("export const updateReport"),
  source.indexOf("export const getAnatomicalParts"),
);
const actionSource = readFileSync(
  new URL("../lib/api/actions/reports.action.ts", import.meta.url),
  "utf8",
);

describe("report update server wiring", () => {
  test("requires the endpoint-specific update schema", () => {
    expect(updateSource).toContain(".validator(updateReportSchema)");
    expect(actionSource).toContain(
      "report: z.input<typeof updateReportSchema>",
    );
  });

  test("increments revision and upserts canonical decisions by composite key", () => {
    expect(updateSource).toContain(
      "revision: sql`${advancedReport.revision} + 1`",
    );
    expect(updateSource).toContain(
      "buildReportSectionStateRows(ownedReport.id, sectionStates)",
    );
    expect(updateSource).toContain("reportSectionState.reportId");
    expect(updateSource).toContain("reportSectionState.section");
    expect(updateSource).toContain("state: sql`excluded.state`");
  });
});
