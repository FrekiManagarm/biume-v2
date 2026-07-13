import { describe, expect, test } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";

import {
  buildReportPdfViewModel,
  getSeverityTone,
  reportPalette,
} from "./ReportPDF.helpers";
import { ReportPDF } from "./ReportPDF";

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
  test("uses the same clinical status colors as the report workspace", () => {
    expect(getSeverityTone(1).fill).toBe("#10B981");
    expect(getSeverityTone(2).fill).toBe("#84CC16");
    expect(getSeverityTone(3).fill).toBe("#F59E0B");
    expect(getSeverityTone(4).fill).toBe("#F43F5E");
    expect(getSeverityTone(5)).toMatchObject({
      fill: "#B91C1C",
      label: "Priorite 5",
    });
  });
});

describe("reportPalette", () => {
  test("uses the workspace's white and slate base instead of an editorial paper tone", () => {
    expect(reportPalette).toMatchObject({
      paper: "#FFFFFF",
      ink: "#0F172A",
      muted: "#64748B",
      accent: "#A78BFA",
    });
  });
});

describe("ReportPDF", () => {
  test("renders anatomical paths when a region has no SVG transform", async () => {
    const buffer = await renderToBuffer(
      ReportPDF({
        report: {
          id: "report_render_01",
          title: "Bilan clinique",
          createdAt: new Date("2026-07-10T09:30:00.000Z"),
          patient: {
            name: "Mistral",
            animal: { code: "dog", name: "Chien" },
          },
          anatomicalIssues: [
            {
              id: "issue_01",
              type: "observation",
              severity: 2,
              anatomicalPart: {
                name: "Epaule",
                pathLeft: "M150 110 h60 v45 h-60 z",
                pathRight: "M280 110 h60 v45 h-60 z",
              },
            },
          ],
        },
        type: "advanced_report",
      }),
    );

    expect(buffer.byteLength).toBeGreaterThan(1_000);
  });
});
