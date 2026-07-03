import { describe, expect, test } from "vitest";

import { buildReportPdfViewModel, getSeverityTone } from "./ReportPDF.helpers";

describe("buildReportPdfViewModel", () => {
  test("builds owner-ready context and organic report metrics", () => {
    const model = buildReportPdfViewModel({
      id: "report_01",
      title: "Bilan locomoteur post-seance",
      createdAt: new Date("2026-07-03T09:30:00.000Z"),
      patient: {
        id: "pet_01",
        name: "Mistral",
        breed: "Berger australien",
        weight: 28,
        height: 54,
        gender: "Male",
        birthDate: new Date("2019-04-17T00:00:00.000Z"),
        owner: {
          name: "Amelie Roussel",
          email: "amelie.roussel@example.com",
          phone: "+33 6 41 72 18 93",
        },
        animal: { code: "dog", name: "Chien" },
      },
      organization: {
        name: "Cabinet Biume Atlantique",
      },
      anatomicalIssues: [
        { id: "issue_1", type: "observation", severity: 1 },
        { id: "issue_2", type: "dysfunction", severity: 4 },
        { id: "issue_3", type: "anatomicalSuspicion", severity: 2 },
      ],
      recommendations: [
        { id: "rec_1", recommendation: "Marche calme pendant quarante-huit heures." },
        { id: "rec_2", recommendation: "Controle si la raideur persiste." },
      ],
    });

    expect(model.patientName).toBe("Mistral");
    expect(model.patientDescriptor).toBe("Chien - Berger australien");
    expect(model.ownerLine).toBe("Amelie Roussel - +33 6 41 72 18 93");
    expect(model.metrics).toEqual([
      { label: "Observations", value: "1", tone: "ink" },
      { label: "Dysfonctions", value: "1", tone: "accent" },
      { label: "Suspicions", value: "1", tone: "sand" },
      { label: "Recommandations", value: "2", tone: "forest" },
    ]);
  });
});

describe("getSeverityTone", () => {
  test("keeps severe findings in the restrained report accent palette", () => {
    expect(getSeverityTone(5)).toMatchObject({
      fill: "#234E45",
      label: "Priorite 5",
    });
  });
});
