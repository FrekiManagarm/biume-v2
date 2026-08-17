import { describe, expect, test } from "vitest";

import { buildReportCreationInput } from "./report-creation";

describe("buildReportCreationInput", () => {
  test("nomme le compte rendu avec la même convention que la création automatique (tâche 6)", () => {
    // Régression : le bouton « Créer le compte rendu » de la carte appelait
    // `createReport` sans titre, ce qui retombait sur le "Nouveau rapport"
    // générique côté serveur — une convention différente de celle posée par
    // `buildSessionReportTitle` pour les comptes rendus créés avec le
    // rendez-vous.
    const input = buildReportCreationInput({
      id: "appointment-1",
      beginAt: new Date("2026-08-17T09:00:00.000Z"),
      patient: { id: "animal-1", name: "Oslo" },
    });

    expect(input).toEqual({
      petId: "animal-1",
      appointmentId: "appointment-1",
      status: "draft",
      title: "Séance Oslo — 17/08/2026",
    });
  });

  test("reste lisible quand l'animal n'a pas de nom", () => {
    const input = buildReportCreationInput({
      id: "appointment-1",
      beginAt: new Date("2026-08-17T09:00:00.000Z"),
      patient: { id: "animal-1", name: null },
    });

    expect(input?.title).toBe("Séance — 17/08/2026");
  });

  test("renvoie null quand le rendez-vous n'a pas de patient rattaché", () => {
    const input = buildReportCreationInput({
      id: "appointment-1",
      beginAt: new Date("2026-08-17T09:00:00.000Z"),
      patient: null,
    });

    expect(input).toBeNull();
  });
});
