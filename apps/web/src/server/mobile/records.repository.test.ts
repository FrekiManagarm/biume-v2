import { describe, expect, it } from "vitest";

import {
  resolveSpecies,
  toHistoryEntry,
  toMobileOwner,
  toMobilePatient,
} from "./records.repository";

describe("resolveSpecies", () => {
  it("reconnaît les codes du catalogue", () => {
    expect(resolveSpecies("DOG")).toBe("DOG");
    expect(resolveSpecies("HORSE")).toBe("HORSE");
    expect(resolveSpecies("COW")).toBe("COW");
  });

  /**
   * Une fiche animale peut être ancienne, importée, ou porter un code retiré du
   * catalogue. Faire échouer la lecture de tout l'agenda pour ça serait une
   * panne de terrain pour une donnée cosmétique.
   */
  it("retombe sur OTHER pour un code inconnu ou absent", () => {
    expect(resolveSpecies(null)).toBe("OTHER");
    expect(resolveSpecies("")).toBe("OTHER");
    expect(resolveSpecies("DRAGON")).toBe("OTHER");
  });

  it("normalise la casse", () => {
    expect(resolveSpecies("dog")).toBe("DOG");
  });
});

describe("toMobileOwner", () => {
  it("normalise les champs absents en null", () => {
    expect(
      toMobileOwner({
        id: "client-1",
        name: "Camille Roux",
        email: null,
        phone: "",
        city: undefined,
        patientCount: 0,
      }),
    ).toEqual({
      id: "client-1",
      name: "Camille Roux",
      email: null,
      phone: null,
      city: null,
      patientCount: 0,
    });
  });
});

describe("toMobilePatient", () => {
  it("sérialise les dates en ISO et tolère l'absence", () => {
    expect(
      toMobilePatient({
        id: "pet-1",
        ownerId: "client-1",
        ownerName: "Camille Roux",
        name: "Filou",
        speciesCode: "DOG",
        breed: null,
        birthDate: new Date("2020-04-11T00:00:00.000Z"),
        lastAppointmentAt: null,
      }),
    ).toEqual({
      id: "pet-1",
      ownerId: "client-1",
      ownerName: "Camille Roux",
      name: "Filou",
      species: "DOG",
      breed: null,
      birthDate: "2020-04-11T00:00:00.000Z",
      lastAppointmentAt: null,
    });
  });
});

describe("toHistoryEntry", () => {
  it("expose l'état du compte rendu sans son contenu", () => {
    const entry = toHistoryEntry({
      appointmentId: "appointment-1",
      beginAt: new Date("2026-08-01T09:00:00.000Z"),
      reportId: "report-1",
      reportStatus: "finalized",
      consultationReason: "Boiterie postérieure",
    });

    expect(entry).toEqual({
      appointmentId: "appointment-1",
      beginAt: "2026-08-01T09:00:00.000Z",
      reportId: "report-1",
      reportStatus: "finalized",
      consultationReason: "Boiterie postérieure",
    });
    expect(Object.keys(entry)).not.toContain("notes");
  });

  it("accepte un rendez-vous sans compte rendu", () => {
    expect(
      toHistoryEntry({
        appointmentId: "appointment-2",
        beginAt: new Date("2026-08-02T09:00:00.000Z"),
        reportId: null,
        reportStatus: null,
        consultationReason: null,
      }),
    ).toMatchObject({
      reportId: null,
      reportStatus: null,
      consultationReason: "",
    });
  });
});
