import { describe, expect, test, vi } from "vitest";

import {
  buildSessionReportTitle,
  createSessionReport,
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
