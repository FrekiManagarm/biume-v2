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

  test("increments revision and upserts all canonical decisions in the atomic batch", () => {
    expect(updateSource).toContain(
      "revision: sql`${advancedReport.revision} + 1`",
    );
    expect(updateSource).toMatch(
      /const mutationQueries = \[[\s\S]*?\.insert\(reportSectionState\)[\s\S]*?\.values\(\s*buildReportSectionStateRows\(ownedReport\.id, sectionStates\),?\s*\)[\s\S]*?\.onConflictDoUpdate\(\{[\s\S]*?reportSectionState\.reportId[\s\S]*?reportSectionState\.section[\s\S]*?state: sql`excluded\.state`[\s\S]*?executeAtomicReportMutations\(mutationQueries/,
    );
  });
});
