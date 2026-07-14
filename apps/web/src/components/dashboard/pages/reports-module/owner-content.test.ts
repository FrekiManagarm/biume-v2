import { describe, expect, test } from "vitest";
import {
  buildOwnerPreparationQueue,
  buildOwnerSourceItems,
  deriveOwnerContentStatus,
  resolveOwnerText,
} from "./owner-content";

const input = {
  reportId: "report_01",
  consultationReason: "Boiterie après effort",
  observations: [
    {
      id: "obs_01",
      region: "Épaule",
      severity: 2,
      notes: "Restriction gléno-humérale",
      type: "dynamic" as const,
      laterality: "left" as const,
    },
  ],
  anatomicalIssues: [
    {
      id: "issue_01",
      type: "dysfunction" as const,
      region: "Cervicales",
      severity: 3,
      notes: "Tension C1-C2",
      laterality: "bilateral" as const,
    },
  ],
  recommendations: [{ id: "rec_01", content: "Repos relatif 48 h" }],
  notes: "Surveiller le confort",
};

describe("owner content", () => {
  test("builds stable sources in professional navigation order", () => {
    const sources = buildOwnerSourceItems(input);
    expect(sources.map((source) => source.key)).toEqual([
      "consultationReason:consultationReason",
      "observation:obs_01",
      "anatomicalIssue:issue_01",
      "recommendation:rec_01",
      "notes:notes",
    ]);
    expect(sources[2]?.fingerprint).toBe(
      buildOwnerSourceItems(input)[2]?.fingerprint,
    );
  });

  test("marks matching text ready and changed source stale", () => {
    const [source] = buildOwnerSourceItems(input);
    const record = {
      id: "owner_01",
      reportId: input.reportId,
      sourceKind: source.sourceKind,
      sourceId: source.sourceId,
      ownerText: "Gêne après une activité soutenue.",
      sourceFingerprint: source.fingerprint,
    };
    expect(deriveOwnerContentStatus(source, record)).toBe("ready");
    expect(
      deriveOwnerContentStatus({ ...source, fingerprint: "changed" }, record),
    ).toBe("stale");
    expect(deriveOwnerContentStatus(source, undefined)).toBe("missing");
  });

  test("queues stale before missing and excludes ready sources", () => {
    const sources = buildOwnerSourceItems(input);
    const records = [
      {
        id: "owner_ready",
        reportId: input.reportId,
        sourceKind: sources[0]!.sourceKind,
        sourceId: sources[0]!.sourceId,
        ownerText: "Motif clair",
        sourceFingerprint: sources[0]!.fingerprint,
      },
      {
        id: "owner_stale",
        reportId: input.reportId,
        sourceKind: sources[2]!.sourceKind,
        sourceId: sources[2]!.sourceId,
        ownerText: "Ancienne formulation",
        sourceFingerprint: "old",
      },
    ];
    expect(
      buildOwnerPreparationQueue(sources, records).map((item) => item.key),
    ).toEqual([
      "anatomicalIssue:issue_01",
      "observation:obs_01",
      "recommendation:rec_01",
      "notes:notes",
    ]);
  });

  test("uses saved owner text before professional fallback", () => {
    const [source] = buildOwnerSourceItems(input);
    expect(resolveOwnerText(source, undefined)).toEqual({
      text: "Boiterie après effort",
      status: "missing",
      usedFallback: true,
    });
  });
});
