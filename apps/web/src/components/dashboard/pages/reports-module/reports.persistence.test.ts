import { describe, expect, test } from "vitest";
import {
  buildQuickReportMutationQueries,
  buildReportChildRows,
  buildReportUpdateMutationQueries,
  executeAtomicReportMutations,
  getRemovedOwnerSources,
} from "./reports.persistence";

describe("quick report mutation composition", () => {
  test("delivers exactly four queries once and propagates batch failure", async () => {
    const ownerInsert = { name: "insert-owner" } as const;
    const animalInsert = { name: "insert-animal" } as const;
    const reportInsert = { name: "insert-report" } as const;
    const sectionStateInsert = { name: "insert-section-states" } as const;
    const mutations = buildQuickReportMutationQueries({
      ownerInsert,
      animalInsert,
      reportInsert,
      sectionStateInsert,
    });
    const receivedBatches: Array<typeof mutations> = [];

    await expect(
      executeAtomicReportMutations(mutations, async (received) => {
        receivedBatches.push(received);
        throw new Error("owner insert failed");
      }),
    ).rejects.toThrow("owner insert failed");

    expect(mutations).toEqual([
      ownerInsert,
      animalInsert,
      reportInsert,
      sectionStateInsert,
    ]);
    expect(receivedBatches).toEqual([mutations]);
  });
});

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
});

describe("report update mutation composition", () => {
  const reportUpdate = { name: "update-report" } as const;
  const sectionStateUpsert = { name: "upsert-section-states" } as const;
  const ownerSourceDeletions = [
    { name: "delete-owner-source-1" },
    { name: "delete-owner-source-2" },
  ] as const;
  const childDeletions = [
    { name: "delete-anatomical-children" },
    { name: "delete-recommendation-children" },
  ] as const;

  test("keeps update and section upsert first while retaining every deletion", () => {
    expect(
      buildReportUpdateMutationQueries({
        reportUpdate,
        sectionStateUpsert,
        ownerSourceDeletions,
        childDeletions,
        childInserts: [],
      }),
    ).toEqual([
      reportUpdate,
      sectionStateUpsert,
      ...ownerSourceDeletions,
      ...childDeletions,
    ]);
  });

  test("includes each optional child insert exactly when supplied", () => {
    const childInserts = [
      { name: "insert-anatomical-issues" },
      { name: "insert-observations" },
      { name: "insert-recommendations" },
    ] as const;

    expect(
      buildReportUpdateMutationQueries({
        reportUpdate,
        sectionStateUpsert,
        ownerSourceDeletions,
        childDeletions,
        childInserts,
      }),
    ).toEqual([
      reportUpdate,
      sectionStateUpsert,
      ...ownerSourceDeletions,
      ...childDeletions,
      ...childInserts,
    ]);
  });

  test("delivers the exact tuple once and propagates executor failure", async () => {
    const mutations = buildReportUpdateMutationQueries({
      reportUpdate,
      sectionStateUpsert,
      ownerSourceDeletions,
      childDeletions,
      childInserts: [{ name: "insert-observations" }] as const,
    });
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
