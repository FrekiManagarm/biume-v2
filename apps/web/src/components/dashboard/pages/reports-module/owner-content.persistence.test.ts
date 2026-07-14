import { describe, expect, test } from "vitest";
import {
  buildPersistedOwnerSources,
  prepareOwnerContentUpsert,
} from "./owner-content.persistence";
import {
  buildOwnerSourceItems,
  deriveOwnerContentStatus,
} from "./owner-content";

const source = {
  key: "observation:obs_01",
  sourceKind: "observation" as const,
  sourceId: "obs_01",
  section: "clinical" as const,
  professionalText: "Restriction gléno-humérale",
  context: "Épaule gauche",
  fingerprint: "abc12345",
  order: 0,
};

describe("prepareOwnerContentUpsert", () => {
  test("uses the persisted source fingerprint and trims owner text", () => {
    expect(
      prepareOwnerContentUpsert({
        reportId: "report_01",
        sourceKind: "observation",
        sourceId: "obs_01",
        ownerText: "  Mobilité réduite de l’épaule.  ",
        sources: [source],
      }),
    ).toMatchObject({
      reportId: "report_01",
      sourceKind: "observation",
      sourceId: "obs_01",
      ownerText: "Mobilité réduite de l’épaule.",
      sourceFingerprint: "abc12345",
    });
  });

  test("rejects an unknown or empty source", () => {
    expect(() =>
      prepareOwnerContentUpsert({
        reportId: "report_01",
        sourceKind: "observation",
        sourceId: "missing",
        ownerText: "Texte",
        sources: [source],
      }),
    ).toThrow("Source de rapport introuvable");
    expect(() =>
      prepareOwnerContentUpsert({
        reportId: "report_01",
        sourceKind: "observation",
        sourceId: "obs_01",
        ownerText: "   ",
        sources: [source],
      }),
    ).toThrow("La version propriétaire est vide");
  });
});

describe("buildPersistedOwnerSources", () => {
  test("rebuilds owner sources from persisted report rows", () => {
    const sources = buildPersistedOwnerSources({
      id: "report_01",
      consultationReason: "Boiterie après effort",
      notes: "Surveiller le confort",
      anatomicalIssues: [
        {
          id: "obs_01",
          type: "observation",
          observationType: "dynamic",
          notes: "Restriction gléno-humérale",
          laterality: "left",
          severity: 2,
          anatomicalPart: { name: "Épaule" },
        },
        {
          id: "issue_01",
          type: "dysfunction",
          observationType: null,
          notes: "Tension C1-C2",
          laterality: "bilateral",
          severity: 3,
          anatomicalPart: null,
        },
      ],
      recommendations: [{ id: "rec_01", recommendation: "Repos relatif 48 h" }],
    });

    expect(sources.map((item) => item.key)).toEqual([
      "consultationReason:consultationReason",
      "observation:obs_01",
      "anatomicalIssue:issue_01",
      "recommendation:rec_01",
      "notes:notes",
    ]);
    expect(sources[1]).toMatchObject({
      professionalText: "Restriction gléno-humérale",
      context: expect.stringContaining("Épaule"),
    });
    expect(sources[2]).toMatchObject({
      professionalText: "Tension C1-C2",
      context: expect.stringContaining("Zone non précisée"),
    });
  });

  test("keeps a newly saved anatomical owner version ready after persistence", () => {
    const report = {
      id: "report_01",
      consultationReason: "",
      notes: "",
      anatomicalIssues: [
        {
          id: "issue_01",
          type: "dysfunction" as const,
          observationType: null,
          notes: "Tension C1-C2",
          laterality: "bilateral" as const,
          severity: 3,
          anatomicalPart: { name: "Cervicales" },
        },
      ],
      recommendations: [],
    };
    const persistedSource = buildPersistedOwnerSources(report)[0]!;
    const saved = prepareOwnerContentUpsert({
      reportId: report.id,
      sourceKind: persistedSource.sourceKind,
      sourceId: persistedSource.sourceId,
      ownerText: "La zone du cou présente une tension.",
      sources: [persistedSource],
    });
    const clientSource = buildOwnerSourceItems({
      reportId: report.id,
      consultationReason: "",
      observations: [],
      anatomicalIssues: [
        {
          id: "issue_01",
          type: "dysfunction",
          region: "database_part_id",
          notes: "Tension C1-C2",
          laterality: "bilateral",
          severity: 3,
          anatomicalPart: { name: "Cervicales" } as never,
        },
      ],
      recommendations: [],
      notes: "",
    })[0]!;

    expect(
      deriveOwnerContentStatus(clientSource, {
        id: "owner_01",
        ...saved,
      }),
    ).toBe("ready");
  });
});
