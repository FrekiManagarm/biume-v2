import { describe, expect, it } from "vitest";
import {
  canFinalizeReport,
  createInitialReportSectionStates,
  ownerReportSnapshotSchema,
  quickReportSchema,
  reportSchema,
} from "./report";

describe("report contracts", () => {
  it("requires every section to be explicitly resolved before finalization", () => {
    expect(
      canFinalizeReport({
        clinical: "confirmed",
        anatomical: "not_applicable",
        recommendations: "confirmed",
        notes: "confirmed",
      }),
    ).toBe(true);
    expect(
      canFinalizeReport({
        clinical: "confirmed",
        anatomical: "empty",
        recommendations: "confirmed",
        notes: "confirmed",
      }),
    ).toBe(false);
  });

  it("starts every new report with empty persisted decisions", () => {
    expect(createInitialReportSectionStates()).toEqual({
      clinical: "empty",
      anatomical: "empty",
      recommendations: "empty",
      notes: "empty",
    });
  });

  it("defaults omitted persisted decisions to empty states", () => {
    expect(
      reportSchema.parse({
        title: "Séance de Nox",
      }).sectionStates,
    ).toEqual({
      clinical: "empty",
      anatomical: "empty",
      recommendations: "empty",
      notes: "empty",
    });
  });

  it("rejects a finalized report while any section is unresolved", () => {
    const result = reportSchema.safeParse({
      title: "Séance de Nox",
      status: "finalized",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Chaque section doit être confirmée ou non applicable",
          path: ["sectionStates"],
        }),
      ]),
    );
  });

  it("accepts the minimum quick-create identity", () => {
    expect(
      quickReportSchema.parse({ ownerName: "Camille", animalName: "Nox" }),
    ).toMatchObject({
      ownerName: "Camille",
      animalName: "Nox",
      title: "Nouveau rapport",
      consultationReason: "",
    });
  });

  it("normalizes a whitespace-only quick-create email to empty", () => {
    expect(
      quickReportSchema.parse({
        ownerName: "Camille",
        ownerEmail: "   ",
        animalName: "Nox",
      }).ownerEmail,
    ).toBe("");
  });

  it("trims a valid quick-create email before validating it", () => {
    expect(
      quickReportSchema.parse({
        ownerName: "Camille",
        ownerEmail: "  camille@example.com  ",
        animalName: "Nox",
      }).ownerEmail,
    ).toBe("camille@example.com");
  });

  it("rejects duplicate anatomical and recommendation identifiers", () => {
    const base = {
      title: "Séance de Nox",
      observations: [],
      anatomicalIssues: [],
      recommendations: [],
      sectionStates: createInitialReportSectionStates(),
    };
    const duplicate = {
      ...base,
      recommendations: [
        { id: "same", content: "Repos" },
        { id: "same", content: "Hydratation" },
      ],
    };
    expect(reportSchema.safeParse(duplicate).success).toBe(false);
  });

  it("requires a self-contained immutable owner snapshot", () => {
    expect(
      ownerReportSnapshotSchema.parse({
        reportId: "report-1",
        reportRevision: 3,
        title: "Séance de Nox",
        animal: { id: "pet-1", name: "Nox" },
        owner: { id: "owner-1", name: "Camille" },
        consultationReason: "Mobilité",
        clinical: ["Raideur observée"],
        anatomical: [],
        recommendations: ["Repos 24 h"],
        notes: "",
        createdAt: "2026-07-18T10:00:00.000Z",
      }).reportRevision,
    ).toBe(3);
  });
});
