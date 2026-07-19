import { describe, expect, it } from "vitest";
import { quickReportSchema } from "@biume/contracts/report";
import {
  buildQuickReportRows,
  buildReportSectionStateRows,
  normalizeReportSectionStates,
} from "./report-domain";

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
      ownerName: " Camille ",
      ownerEmail: "camille@example.com",
      animalName: " Nox ",
      title: "Nouveau rapport",
      consultationReason: "",
    },
    ids: { ownerId: "owner-1", animalId: "pet-1", reportId: "report-1" },
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
  });
  expect(rows.sectionStates).toHaveLength(4);
});

it("stores an omitted quick-create email as null", () => {
  const rows = buildQuickReportRows({
    organizationId: "org-1",
    input: {
      ownerName: "Camille",
      animalName: "Nox",
      title: "Nouveau rapport",
      consultationReason: "",
    },
    ids: { ownerId: "owner-1", animalId: "pet-1", reportId: "report-1" },
    now: new Date("2026-07-18T10:00:00.000Z"),
  });
  expect(rows.owner.email).toBeNull();
});

it("stores a normalized whitespace-only quick-create email as null", () => {
  const rows = buildQuickReportRows({
    organizationId: "org-1",
    input: quickReportSchema.parse({
      ownerName: "Camille",
      ownerEmail: "   ",
      animalName: "Nox",
    }),
    ids: { ownerId: "owner-1", animalId: "pet-1", reportId: "report-1" },
    now: new Date("2026-07-18T10:00:00.000Z"),
  });

  expect(rows.owner.email).toBeNull();
});
