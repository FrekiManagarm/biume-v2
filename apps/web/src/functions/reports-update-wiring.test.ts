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

  test("executes the optimistic update and all replacements through one atomic statement", () => {
    expect(updateSource).toContain("expectedRevision");
    expect(updateSource).toContain("buildAtomicReportUpdateStatement");
    expect(updateSource).toContain("updateReportWithExpectedRevision");
    expect(updateSource).toContain("buildReportSectionStateRows(");
    expect(updateSource).not.toContain("db.batch(queries)");
  });
});
