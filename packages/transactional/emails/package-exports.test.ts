import { describe, expect, test } from "bun:test";

import NewReportClientEmail from "@biume/emails/NewReportClientEmail";

describe("@biume/emails package exports", () => {
  test("resolves TSX email templates through package subpaths", () => {
    expect(typeof NewReportClientEmail).toBe("function");
  });
});
