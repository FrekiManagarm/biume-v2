import { describe, expect, it } from "vitest";

import {
  REPORT_REVISION_CONFLICT_MESSAGE,
  updateReportWithExpectedRevision,
  type AtomicReportUpdatePort,
} from "./report-update.service";

describe("optimistic report updates", () => {
  it("allows only one of two writers at the same revision to replace children", async () => {
    let persistedRevision = 4;
    const childSnapshots: string[][] = [];
    const port: AtomicReportUpdatePort<string[]> = {
      persistAtomic: async ({ expectedRevision, replacement }) => {
        if (persistedRevision !== expectedRevision) return undefined;
        persistedRevision += 1;
        childSnapshots.push(replacement);
        return { revision: persistedRevision };
      },
    };

    const results = await Promise.allSettled([
      updateReportWithExpectedRevision(
        { expectedRevision: 4, replacement: ["writer-a-child"] },
        port,
      ),
      updateReportWithExpectedRevision(
        { expectedRevision: 4, replacement: ["writer-b-child"] },
        port,
      ),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(
      1,
    );
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(
      1,
    );
    expect(childSnapshots).toHaveLength(1);
    expect(persistedRevision).toBe(5);
    expect(
      results.find((result) => result.status === "rejected"),
    ).toMatchObject({
      reason: expect.objectContaining({
        message: REPORT_REVISION_CONFLICT_MESSAGE,
        name: "ReportRevisionConflictError",
      }),
    });
  });

  it("does not expose success when the atomic persistence port reports a stale write", async () => {
    const port: AtomicReportUpdatePort<string[]> = {
      persistAtomic: async () => undefined,
    };

    await expect(
      updateReportWithExpectedRevision(
        { expectedRevision: 2, replacement: ["must-not-persist"] },
        port,
      ),
    ).rejects.toThrow(REPORT_REVISION_CONFLICT_MESSAGE);
  });
});
