import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { executeOwnerContentRevisionMutation } from "./report-domain";

describe("owner-content mutation", () => {
  it("persists owner content and advances the report revision atomically", async () => {
    const ownerContentUpsert = { operation: "owner-content-upsert" };
    const reportRevisionUpdate = { operation: "report-revision-update" };
    const executeBatch = vi.fn(
      async () => [[{ id: "owner-content-1" }], []] as const,
    );

    const saved = await executeOwnerContentRevisionMutation({
      ownerContentUpsert,
      reportRevisionUpdate,
      executeBatch,
    });

    expect(executeBatch).toHaveBeenCalledOnce();
    expect(executeBatch).toHaveBeenCalledWith([
      ownerContentUpsert,
      reportRevisionUpdate,
    ]);
    expect(saved).toEqual({ id: "owner-content-1" });
  });

  it("scopes the revision increment to the tenant-owned report", () => {
    const source = readFileSync(
      new URL("./report-owner-content.function.ts", import.meta.url),
      "utf8",
    );

    expect(source).toContain("revision: sql`${advancedReport.revision} + 1`");
    expect(source).toContain("eq(advancedReport.createdBy, organization.id)");
  });
});
