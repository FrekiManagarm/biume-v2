import { describe, expect, it } from "vitest";
import { quickReportSchema } from "@biume/contracts/report";
import {
  assertReportCanBeShared,
  buildOwnerReportSnapshot,
  buildQuickReportRows,
  buildReportSectionStateRows,
  normalizeReportSectionStates,
  resolveOwnerFacingText,
  toReportContentSummary,
} from "./report-domain";

describe("toReportContentSummary", () => {
  it("counts loaded anatomical issues and recommendations separately", () => {
    expect(
      toReportContentSummary({
        consultationReason: "Boiterie postérieure droite",
        notes: "Suivi dans deux semaines",
        anatomicalIssues: [{ id: "issue-1" }, { id: "issue-2" }],
        recommendations: [{ id: "rec-1" }],
      }),
    ).toEqual({
      consultationReason: "Boiterie postérieure droite",
      notes: "Suivi dans deux semaines",
      anatomicalIssueCount: 2,
      recommendationCount: 1,
    });
  });

  it("returns zero counts for empty relations", () => {
    expect(
      toReportContentSummary({
        consultationReason: "",
        notes: "",
        anatomicalIssues: [],
        recommendations: [],
      }),
    ).toEqual({
      consultationReason: "",
      notes: "",
      anatomicalIssueCount: 0,
      recommendationCount: 0,
    });
  });

  it("passes a null notes value through unchanged", () => {
    expect(
      toReportContentSummary({
        consultationReason: "",
        notes: null,
        anatomicalIssues: [],
        recommendations: [],
      }).notes,
    ).toBeNull();
  });
});

describe("report section persistence", () => {
  it("builds one row for every canonical section", () => {
    expect(
      buildReportSectionStateRows("report-1", {
        clinical: "confirmed",
        anatomical: "not_applicable",
        recommendations: "needs_confirmation",
        notes: "empty",
      }),
    ).toEqual([
      { reportId: "report-1", section: "clinical", state: "confirmed" },
      {
        reportId: "report-1",
        section: "anatomical",
        state: "not_applicable",
      },
      {
        reportId: "report-1",
        section: "recommendations",
        state: "needs_confirmation",
      },
      { reportId: "report-1", section: "notes", state: "empty" },
    ]);
  });

  it("fills missing legacy rows with empty decisions", () => {
    expect(
      normalizeReportSectionStates([
        { section: "clinical", state: "confirmed" },
      ]),
    ).toEqual({
      clinical: "confirmed",
      anatomical: "empty",
      recommendations: "empty",
      notes: "empty",
    });
  });
});

it("builds owner, animal, report, and four decisions from minimum input", () => {
  const rows = buildQuickReportRows({
    organizationId: "org-1",
    input: {
      clientRequestId: "123e4567-e89b-42d3-a456-426614174000",
      ownerName: " Camille ",
      ownerEmail: "camille@example.com",
      animalName: " Nox ",
      title: "Nouveau rapport",
      consultationReason: "",
    },
    ids: { ownerId: "owner-1", animalId: "pet-1", reportId: "report-1" },
    requestFingerprint: "fingerprint-1",
    now: new Date("2026-07-18T10:00:00.000Z"),
  });

  expect(rows.owner).toMatchObject({
    id: "owner-1",
    organizationId: "org-1",
    name: "Camille",
    email: "camille@example.com",
  });
  expect(rows.animal).toMatchObject({
    id: "pet-1",
    organizationId: "org-1",
    ownerId: "owner-1",
    name: "Nox",
  });
  expect(rows.report).toMatchObject({
    id: "report-1",
    createdBy: "org-1",
    patientId: "pet-1",
    status: "draft",
    clientRequestId: "123e4567-e89b-42d3-a456-426614174000",
    quickRequestFingerprint: "fingerprint-1",
  });
  expect(rows.sectionStates).toHaveLength(4);
});

it("stores an omitted quick-create email as null", () => {
  const rows = buildQuickReportRows({
    organizationId: "org-1",
    input: {
      clientRequestId: "123e4567-e89b-42d3-a456-426614174000",
      ownerName: "Camille",
      animalName: "Nox",
      title: "Nouveau rapport",
      consultationReason: "",
    },
    ids: { ownerId: "owner-1", animalId: "pet-1", reportId: "report-1" },
    requestFingerprint: "fingerprint-1",
    now: new Date("2026-07-18T10:00:00.000Z"),
  });
  expect(rows.owner.email).toBeNull();
});

it("stores a normalized whitespace-only quick-create email as null", () => {
  const rows = buildQuickReportRows({
    organizationId: "org-1",
    input: quickReportSchema.parse({
      clientRequestId: "123e4567-e89b-42d3-a456-426614174000",
      ownerName: "Camille",
      ownerEmail: "   ",
      animalName: "Nox",
    }),
    ids: { ownerId: "owner-1", animalId: "pet-1", reportId: "report-1" },
    requestFingerprint: "fingerprint-1",
    now: new Date("2026-07-18T10:00:00.000Z"),
  });

  expect(rows.owner.email).toBeNull();
});

it("builds a self-contained owner snapshot at an exact revision", () => {
  expect(
    buildOwnerReportSnapshot({
      reportId: "report-1",
      reportRevision: 2,
      title: "Séance de Nox",
      animal: { id: "pet-1", name: "Nox" },
      owner: { id: "owner-1", name: "Camille" },
      consultationReason: "Mobilité réduite",
      clinical: ["Raideur au démarrage"],
      anatomical: ["Tension cervicale"],
      recommendations: ["Repos pendant 24 heures"],
      notes: "Surveiller la récupération",
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
    }),
  ).toEqual({
    reportId: "report-1",
    reportRevision: 2,
    title: "Séance de Nox",
    animal: { id: "pet-1", name: "Nox" },
    owner: { id: "owner-1", name: "Camille" },
    consultationReason: "Mobilité réduite",
    clinical: ["Raideur au démarrage"],
    anatomical: ["Tension cervicale"],
    recommendations: ["Repos pendant 24 heures"],
    notes: "Surveiller la récupération",
    createdAt: "2026-07-18T10:00:00.000Z",
  });
});

it("rejects a non-positive revision", () => {
  expect(() =>
    buildOwnerReportSnapshot({
      reportId: "report-1",
      reportRevision: 0,
      title: "Rapport",
      animal: { id: "pet-1", name: "Nox" },
      owner: { id: "owner-1", name: "Camille" },
      consultationReason: "",
      clinical: [],
      anatomical: [],
      recommendations: [],
      notes: "",
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
    }),
  ).toThrow();
});

it("uses practitioner-approved owner text and otherwise keeps validated source text", () => {
  const records = [
    {
      sourceKind: "recommendation" as const,
      sourceId: "rec-1",
      ownerText: "Laissez Nox se reposer pendant 24 heures.",
    },
  ];
  expect(
    resolveOwnerFacingText(records, "recommendation", "rec-1", "Repos 24 h"),
  ).toBe("Laissez Nox se reposer pendant 24 heures.");
  expect(resolveOwnerFacingText(records, "notes", "notes", "Surveiller")).toBe(
    "Surveiller",
  );
});

it("requires practitioner finalization before creating a shared version", () => {
  const resolved = {
    clinical: "confirmed" as const,
    anatomical: "not_applicable" as const,
    recommendations: "confirmed" as const,
    notes: "not_applicable" as const,
  };

  expect(() => assertReportCanBeShared("draft", resolved)).toThrow(
    "Le rapport doit être finalisé avant son partage",
  );
  expect(() =>
    assertReportCanBeShared("finalized", {
      ...resolved,
      notes: "needs_confirmation",
    }),
  ).toThrow("Le rapport doit être finalisé avant son partage");
  expect(() => assertReportCanBeShared("finalized", resolved)).not.toThrow();
});
