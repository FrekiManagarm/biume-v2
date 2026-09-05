import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, test } from "vitest";

import type { ReportPdfReport } from "./ReportPDF.helpers";
import { OwnerReportPDF } from "./ReportPDF.owner";
import {
  getOwnerSeverityTone,
  getOwnerSideLabel,
  registerOwnerFonts,
} from "./ReportPDF.owner.helpers";

/**
 * Deux pages, quatre polices et deux illustrations de 4000 px : un rendu dure
 * environ deux secondes, et le défaut de 5 s de vitest saute dès que le reste
 * de la suite tourne en parallèle.
 */
const RENDER_TIMEOUT_MS = 30_000;

/** nombre de `<Page>` réellement écrites dans le document */
function countPages(pdf: Buffer): number {
  return pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g)?.length ?? 0;
}

const report: ReportPdfReport = {
  id: "rep_owner_01",
  title: "Bilan locomoteur",
  createdAt: new Date("2026-08-28T10:15:00.000Z"),
  consultationReason: "Hésite à sauter dans le coffre depuis quinze jours.",
  notes: "Séance bien tolérée, contrôle dans trois semaines.",
  patient: {
    name: "Mistral",
    breed: "Berger australien",
    owner: { name: "Amélie" },
    animal: { code: "dog", name: "Chien" },
  },
  organization: { name: "Cabinet Biume Atlantique" },
  anatomicalIssues: [
    {
      id: "issue_01",
      type: "dysfunction",
      severity: 4,
      laterality: "left",
      notes: "Le bassin gauche est nettement moins mobile que le droit.",
      anatomicalPart: {
        name: "Bassin",
        pathLeft: "M300 150 h90 v70 h-90 z",
        pathRight: "M120 150 h90 v70 h-90 z",
      },
    },
  ],
  recommendations: [
    {
      id: "rec_01",
      recommendation: "Marche calme pendant quarante-huit heures.",
    },
  ],
};

describe("vocabulaire propriétaire", () => {
  test("nomme la sévérité au lieu de la numéroter", () => {
    // le propriétaire lit « Sévère », pas « Priorite 4 »
    expect(getOwnerSeverityTone(4).label).toBe("Sévère");
    expect(getOwnerSeverityTone(1).label).toBe("Légère");
    expect(getOwnerSeverityTone(null).label).toBe("Non renseignée");
  });

  test("écrit la latéralité en français courant", () => {
    expect(getOwnerSideLabel("bilateral")).toBe("des deux côtés");
    expect(getOwnerSideLabel("left")).toBe("côté gauche");
    expect(getOwnerSideLabel(null)).toBe("");
  });
});

describe("polices", () => {
  test("trouve Hanken Grotesk dans public/fonts", () => {
    // Sans les `.ttf`, `registerOwnerFonts` retombe silencieusement sur
    // Helvetica : le document sort, mais dans une autre typographie que
    // l'application. Ce test est le seul endroit où cette bascule se voit.
    expect(registerOwnerFonts()).toBe("HankenGrotesk");
  });
});

describe("OwnerReportPDF", () => {
  test(
    "tient en deux pages",
    async () => {
      const pdf = await renderToBuffer(
        OwnerReportPDF({ report, type: "advanced_report" }),
      );

      expect(countPages(pdf)).toBe(2);
      expect(pdf.byteLength).toBeGreaterThan(1_000);
    },
    RENDER_TIMEOUT_MS,
  );

  test(
    "réserve la cartographie anatomique au compte rendu avancé",
    async () => {
      // Les illustrations pèsent l'essentiel du document : sans elles le PDF
      // est franchement plus léger.
      const [advanced, simple] = await Promise.all([
        renderToBuffer(OwnerReportPDF({ report, type: "advanced_report" })),
        renderToBuffer(OwnerReportPDF({ report, type: "report" })),
      ]);

      expect(simple.byteLength).toBeLessThan(advanced.byteLength / 2);
    },
    RENDER_TIMEOUT_MS,
  );

  test(
    "rend le document même sans point ni consigne",
    async () => {
      const pdf = await renderToBuffer(
        OwnerReportPDF({
          report: { ...report, anatomicalIssues: [], recommendations: [] },
          type: "advanced_report",
        }),
      );

      expect(countPages(pdf)).toBe(2);
    },
    RENDER_TIMEOUT_MS,
  );
});
