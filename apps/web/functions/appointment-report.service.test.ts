import { describe, expect, test, vi } from "vitest";

import {
  buildSessionReportTitle,
  createSessionReport,
  resolveReportsOnAppointmentDeletion,
} from "./appointment-report.service";

const input = {
  appointmentId: "appointment-1",
  patientId: "animal-1",
  animalName: "Oslo",
  beginAt: new Date("2026-08-17T09:00:00.000Z"),
  note: null,
  withReport: true,
};

describe("buildSessionReportTitle", () => {
  test("nomme le compte rendu par l'animal et la date de séance", () => {
    expect(buildSessionReportTitle("Oslo", input.beginAt)).toBe(
      "Séance Oslo — 17/08/2026",
    );
  });

  test("reste lisible quand l'animal n'a pas de nom", () => {
    expect(buildSessionReportTitle(null, input.beginAt)).toBe(
      "Séance — 17/08/2026",
    );
  });
});

describe("createSessionReport", () => {
  test("ne crée rien quand la case n'est pas cochée", async () => {
    const insertReport = vi.fn();

    const result = await createSessionReport(
      { insertReport },
      { ...input, withReport: false },
    );

    expect(result).toBeNull();
    expect(insertReport).not.toHaveBeenCalled();
  });

  test("crée un brouillon rattaché au rendez-vous et à l'animal", async () => {
    const insertReport = vi.fn().mockResolvedValue("report-1");

    const result = await createSessionReport({ insertReport }, input);

    expect(result).toEqual({ reportId: "report-1" });
    expect(insertReport).toHaveBeenCalledWith({
      appointmentId: "appointment-1",
      patientId: "animal-1",
      title: "Séance Oslo — 17/08/2026",
      consultationReason: "",
    });
  });

  test("la note du rendez-vous ne préremplit pas le motif de consultation", async () => {
    const insertReport = vi.fn().mockResolvedValue("report-1");

    await createSessionReport(
      { insertReport },
      { ...input, note: "Portail au fond de la cour" },
    );

    expect(insertReport).toHaveBeenCalledWith(
      expect.objectContaining({ consultationReason: "" }),
    );
  });
});

describe("resolveReportsOnAppointmentDeletion", () => {
  const emptyReport = {
    id: "vide",
    consultationReason: "",
    notes: null,
    anatomicalIssueCount: 0,
    recommendationCount: 0,
  };
  const startedReport = {
    id: "rempli",
    consultationReason: "Boiterie postérieur droit",
    notes: null,
    anatomicalIssueCount: 2,
    recommendationCount: 1,
  };

  test("un brouillon vide part avec le rendez-vous", () => {
    expect(resolveReportsOnAppointmentDeletion([emptyReport])).toEqual({
      deleteIds: ["vide"],
      detachIds: [],
    });
  });

  test("un compte rendu rempli survit, détaché", () => {
    expect(resolveReportsOnAppointmentDeletion([startedReport])).toEqual({
      deleteIds: [],
      detachIds: ["rempli"],
    });
  });

  test("les deux cas cohabitent sur un même rendez-vous", () => {
    expect(
      resolveReportsOnAppointmentDeletion([emptyReport, startedReport]),
    ).toEqual({ deleteIds: ["vide"], detachIds: ["rempli"] });
  });

  test("aucun compte rendu, rien à faire", () => {
    expect(resolveReportsOnAppointmentDeletion([])).toEqual({
      deleteIds: [],
      detachIds: [],
    });
  });
});
