import { describe, expect, test } from "vitest";

import { buildOwnerSourceItems } from "../owner-content";
import { buildReportPdfViewModel } from "./ReportPDF.helpers";

describe("buildReportPdfViewModel", () => {
  test("builds owner-ready context from a practitioner report", () => {
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
  });

  test("prefers current owner text and falls back to professional text", () => {
    const ownerSources = buildOwnerSourceItems({
      reportId: "report_owner_pdf",
      consultationReason: "Motif technique",
      observations: [],
      anatomicalIssues: [],
      recommendations: [],
      notes: "Note professionnelle",
    });
    const notesSource = ownerSources.find(
      (source) => source.sourceKind === "notes",
    );
    const model = buildReportPdfViewModel({
      id: "report_owner_pdf",
      title: "Compte rendu",
      createdAt: new Date("2026-07-14T09:00:00Z"),
      consultationReason: "Motif technique",
      notes: "Note professionnelle",
      anatomicalIssues: [],
      recommendations: [],
      ownerContents: [
        {
          id: "owner_notes",
          reportId: "report_owner_pdf",
          sourceKind: "notes",
          sourceId: "notes",
          ownerText: "Note claire pour le propriétaire",
          sourceFingerprint: notesSource!.fingerprint,
        },
      ],
    });

    expect(model.consultationReason).toBe("Motif technique");
    expect(model.practitionerNotes).toBe("Note claire pour le propriétaire");
  });

  test("resolves owner text for clinical issues and recommendations", () => {
    const ownerSources = buildOwnerSourceItems({
      reportId: "report_owner_items",
      consultationReason: "",
      observations: [
        {
          id: "observation_01",
          region: "Épaule",
          severity: 2,
          notes: "Restriction technique",
          type: "dynamic",
          laterality: "left",
        },
      ],
      anatomicalIssues: [],
      recommendations: [{ id: "recommendation_01", content: "Repos 48 h" }],
      notes: "",
    });
    const observationSource = ownerSources.find(
      (source) => source.sourceKind === "observation",
    );
    const model = buildReportPdfViewModel({
      id: "report_owner_items",
      title: "Compte rendu",
      createdAt: new Date("2026-07-14T09:00:00Z"),
      anatomicalIssues: [
        {
          id: "observation_01",
          type: "observation",
          observationType: "dynamic",
          laterality: "left",
          severity: 2,
          notes: "Restriction technique",
          anatomicalPart: { name: "Épaule" },
        },
      ],
      recommendations: [
        { id: "recommendation_01", recommendation: "Repos 48 h" },
      ],
      ownerContents: [
        {
          id: "owner_observation",
          reportId: "report_owner_items",
          sourceKind: "observation",
          sourceId: "observation_01",
          ownerText: "L’épaule gauche bouge moins librement.",
          sourceFingerprint: observationSource!.fingerprint,
        },
      ],
    });

    expect(model.issues[0]?.notes).toBe(
      "L’épaule gauche bouge moins librement.",
    );
    expect(model.recommendations[0]?.recommendation).toBe("Repos 48 h");
  });

  test("preserves stale owner text in the PDF view model", () => {
    const model = buildReportPdfViewModel({
      id: "report_stale_pdf",
      title: "Compte rendu",
      createdAt: new Date("2026-07-14T09:00:00Z"),
      anatomicalIssues: [
        {
          id: "observation_stale",
          type: "observation",
          observationType: "dynamic",
          laterality: "right",
          severity: 3,
          notes: "Restriction professionnelle actualisée",
          anatomicalPart: { name: "Hanche" },
        },
      ],
      recommendations: [],
      ownerContents: [
        {
          id: "owner_stale",
          reportId: "report_stale_pdf",
          sourceKind: "observation",
          sourceId: "observation_stale",
          ownerText: "La hanche droite reste moins mobile.",
          sourceFingerprint: "ancienne-empreinte",
        },
      ],
    });

    expect(model.issues[0]?.notes).toBe(
      "La hanche droite reste moins mobile.",
    );
  });

  test("uses owner text for an anatomical issue in the PDF view model", () => {
    const ownerSources = buildOwnerSourceItems({
      reportId: "report_anatomical_pdf",
      consultationReason: "",
      observations: [],
      anatomicalIssues: [
        {
          id: "issue_anatomical",
          type: "dysfunction",
          region: "Bassin",
          severity: 2,
          notes: "Dysfonction ilio-sacrée",
          laterality: "left",
        },
      ],
      recommendations: [],
      notes: "",
    });
    const anatomicalSource = ownerSources.find(
      (source) => source.sourceKind === "anatomicalIssue",
    );
    const model = buildReportPdfViewModel({
      id: "report_anatomical_pdf",
      title: "Compte rendu",
      createdAt: new Date("2026-07-14T09:00:00Z"),
      anatomicalIssues: [
        {
          id: "issue_anatomical",
          type: "dysfunction",
          laterality: "left",
          severity: 2,
          notes: "Dysfonction ilio-sacrée",
          anatomicalPart: { name: "Bassin" },
        },
      ],
      recommendations: [],
      ownerContents: [
        {
          id: "owner_anatomical",
          reportId: "report_anatomical_pdf",
          sourceKind: "anatomicalIssue",
          sourceId: "issue_anatomical",
          ownerText: "Le bassin gauche manque légèrement de mobilité.",
          sourceFingerprint: anatomicalSource!.fingerprint,
        },
      ],
    });

    expect(model.issues[0]?.notes).toBe(
      "Le bassin gauche manque légèrement de mobilité.",
    );
  });
});
