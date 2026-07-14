import { describe, expect, test } from "vitest";
import {
  buildReportChildRows,
  executeAtomicReportMutations,
  getRemovedOwnerSources,
} from "./reports.persistence";

describe("report child persistence", () => {
  test("reuses every validated client item id", () => {
    const rows = buildReportChildRows({
      reportId: "report_01",
      observations: [
        {
          id: "obs_01",
          region: "part_01",
          severity: 2,
          notes: "Observation",
          type: "dynamic",
          laterality: "left",
        },
      ],
      anatomicalIssues: [
        {
          id: "issue_01",
          type: "dysfunction",
          region: "part_02",
          severity: 3,
          notes: "Dysfonction",
          laterality: "bilateral",
        },
      ],
      recommendations: [{ id: "rec_01", content: "Repos" }],
      resolveAnatomicalPartId: (item) => item.region,
    });

    expect(rows.observations[0]?.id).toBe("obs_01");
    expect(rows.anatomicalIssues[0]?.id).toBe("issue_01");
    expect(rows.recommendations[0]?.id).toBe("rec_01");
  });

  test("returns only owner sources removed from the professional report", () => {
    expect(
      getRemovedOwnerSources(
        [
          { sourceKind: "observation", sourceId: "obs_keep" },
          { sourceKind: "observation", sourceId: "obs_delete" },
          { sourceKind: "recommendation", sourceId: "rec_delete" },
          {
            sourceKind: "consultationReason",
            sourceId: "consultationReason",
          },
          { sourceKind: "notes", sourceId: "notes" },
        ],
        {
          observation: ["obs_keep"],
          anatomicalIssue: [],
          recommendation: [],
        },
      ),
    ).toEqual([
      { sourceKind: "observation", sourceId: "obs_delete" },
      { sourceKind: "recommendation", sourceId: "rec_delete" },
    ]);
  });

  test("submits all report mutations to one atomic batch and propagates failure", async () => {
    const mutations = [
      { name: "update-report" },
      { name: "delete-owner-source" },
      { name: "replace-children" },
    ] as const;
    const receivedBatches: Array<typeof mutations> = [];

    await expect(
      executeAtomicReportMutations(mutations, async (received) => {
        receivedBatches.push(received);
        throw new Error("duplicate child id");
      }),
    ).rejects.toThrow("duplicate child id");

    expect(receivedBatches).toEqual([mutations]);
  });
});
