import { describe, expect, test } from "vitest";

import { buildOwnerSourceItems } from "./owner-content";
import { buildOwnerReportViewModel } from "./owner-report-view-model";

describe("buildOwnerReportViewModel", () => {
  test("uses owner text, preserves stale text, and falls back when missing", () => {
    const sources = buildOwnerSourceItems({
      reportId: "report_01",
      consultationReason: "Boiterie après effort",
      observations: [
        {
          id: "obs_01",
          region: "Épaule",
          severity: 2,
          notes: "Restriction technique",
          type: "dynamic",
          laterality: "left",
        },
      ],
      anatomicalIssues: [],
      recommendations: [{ id: "rec_01", content: "Repos 48 h" }],
      notes: "Surveillance",
    });
    const model = buildOwnerReportViewModel(sources, [
      {
        id: "owner_reason",
        reportId: "report_01",
        sourceKind: "consultationReason",
        sourceId: "consultationReason",
        ownerText: "Gêne après une activité soutenue.",
        sourceFingerprint: sources[0]!.fingerprint,
      },
      {
        id: "owner_obs",
        reportId: "report_01",
        sourceKind: "observation",
        sourceId: "obs_01",
        ownerText: "L’épaule gauche bouge moins librement.",
        sourceFingerprint: "old",
      },
    ]);

    expect(model.byKey["consultationReason:consultationReason"]).toMatchObject({
      text: "Gêne après une activité soutenue.",
      status: "ready",
      usedFallback: false,
    });
    expect(model.byKey["observation:obs_01"]).toMatchObject({
      text: "L’épaule gauche bouge moins librement.",
      status: "stale",
      usedFallback: false,
    });
    expect(model.byKey["recommendation:rec_01"]).toMatchObject({
      text: "Repos 48 h",
      status: "missing",
      usedFallback: true,
    });
  });
});
