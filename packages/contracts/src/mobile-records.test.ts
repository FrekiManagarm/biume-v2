import { describe, expect, it } from "vitest";

import {
  appointmentWriteResponseSchema,
  createAppointmentRequestSchema,
  createMobileOwnerRequestSchema,
  createMobilePatientRequestSchema,
  mobileOwnerSchema,
  mobilePatientHistoryResponseSchema,
  mobilePatientSchema,
  mobileRecordsPageSize,
  moveAppointmentRequestSchema,
} from "./mobile-records";

describe("fiche propriétaire", () => {
  const owner = {
    id: "client-1",
    name: "Camille Roux",
    email: "camille@example.test",
    phone: "0600000000",
    city: "Rennes",
    patientCount: 2,
  };

  it("accepte une fiche complète", () => {
    expect(mobileOwnerSchema.parse(owner)).toEqual(owner);
  });

  it("accepte un propriétaire sans coordonnées", () => {
    expect(
      mobileOwnerSchema.parse({
        ...owner,
        email: null,
        phone: null,
        city: null,
      }),
    ).toMatchObject({ email: null, phone: null });
  });

  /**
   * Un champ non déclaré est une charge rejetée. Le mobile ne doit jamais
   * pouvoir influencer l'appartenance à une organisation.
   */
  it("rejette un champ non déclaré", () => {
    expect(() =>
      mobileOwnerSchema.parse({ ...owner, organizationId: "org-1" }),
    ).toThrow();
  });
});

describe("fiche animal", () => {
  const patient = {
    id: "pet-1",
    ownerId: "client-1",
    ownerName: "Camille Roux",
    name: "Filou",
    species: "DOG",
    breed: "Border collie",
    birthDate: "2020-04-11T00:00:00.000Z",
    lastAppointmentAt: null,
  };

  it("accepte une fiche complète", () => {
    expect(mobilePatientSchema.parse(patient)).toEqual(patient);
  });

  it("accepte une espèce hors atlas anatomique", () => {
    expect(
      mobilePatientSchema.parse({ ...patient, species: "COW" }).species,
    ).toBe("COW");
  });

  it("rejette une espèce inconnue", () => {
    expect(() =>
      mobilePatientSchema.parse({ ...patient, species: "DRAGON" }),
    ).toThrow();
  });
});

describe("historique d'un animal", () => {
  it("borne la page", () => {
    const entries = Array.from({ length: mobileRecordsPageSize + 1 }, () => ({
      appointmentId: "appointment-1",
      beginAt: "2026-08-01T09:00:00.000Z",
      reportId: null,
      reportStatus: null,
      consultationReason: "",
    }));

    expect(() =>
      mobilePatientHistoryResponseSchema.parse({
        items: entries,
        nextCursor: null,
      }),
    ).toThrow();
  });
});

describe("création d'un propriétaire", () => {
  it("exige un nom non vide", () => {
    expect(() => createMobileOwnerRequestSchema.parse({ name: "  " })).toThrow();
  });

  it("accepte un nom seul", () => {
    expect(
      createMobileOwnerRequestSchema.parse({ name: "Camille Roux" }),
    ).toEqual({ name: "Camille Roux" });
  });

  /**
   * Sur le terrain, le praticien connaît le nom de l'animal et son espèce.
   * Exiger la race, le poids ou la date de naissance bloquerait la création
   * au moment précis où elle doit être immédiate.
   */
  it("n'exige que le nom, l'espèce et le propriétaire pour un animal", () => {
    expect(
      createMobilePatientRequestSchema.parse({
        ownerId: "client-1",
        name: "Filou",
        species: "DOG",
      }),
    ).toMatchObject({ name: "Filou", species: "DOG" });
  });
});

describe("déplacement d'un rendez-vous", () => {
  it("rejette une fin antérieure au début", () => {
    expect(() =>
      moveAppointmentRequestSchema.parse({
        beginAt: "2026-08-21T11:00:00.000Z",
        endAt: "2026-08-21T10:00:00.000Z",
      }),
    ).toThrow();
  });

  it("rejette un créneau de durée nulle", () => {
    expect(() =>
      moveAppointmentRequestSchema.parse({
        beginAt: "2026-08-21T10:00:00.000Z",
        endAt: "2026-08-21T10:00:00.000Z",
      }),
    ).toThrow();
  });

  it("accepte un créneau valide", () => {
    expect(
      moveAppointmentRequestSchema.parse({
        beginAt: "2026-08-21T10:00:00.000Z",
        endAt: "2026-08-21T11:00:00.000Z",
      }),
    ).toMatchObject({ beginAt: "2026-08-21T10:00:00.000Z" });
  });
});

describe("création d'une séance", () => {
  const request = {
    patientId: "pet-1",
    beginAt: "2026-08-21T10:00:00.000Z",
    endAt: "2026-08-21T11:00:00.000Z",
    atHome: true,
  };

  it("accepte une demande complète", () => {
    expect(createAppointmentRequestSchema.parse(request)).toEqual(request);
  });

  it("rejette une fin antérieure au début", () => {
    expect(() =>
      createAppointmentRequestSchema.parse({
        ...request,
        beginAt: request.endAt,
        endAt: request.beginAt,
      }),
    ).toThrow();
  });

  it("exige atHome", () => {
    const { atHome, ...withoutAtHome } = request;
    expect(() => createAppointmentRequestSchema.parse(withoutAtHome)).toThrow();
  });

  it("rejette un champ non déclaré", () => {
    expect(() =>
      createAppointmentRequestSchema.parse({ ...request, organizationId: "org-1" }),
    ).toThrow();
  });
});

describe("réponse d'écriture d'une séance", () => {
  const response = {
    appointmentId: "appointment-1",
    reportId: "report-1",
    beginAt: "2026-08-21T10:00:00.000Z",
    endAt: "2026-08-21T11:00:00.000Z",
    conflicts: [],
  };

  it("accepte un brouillon lié", () => {
    expect(appointmentWriteResponseSchema.parse(response)).toEqual(response);
  });

  it("accepte l'absence de brouillon", () => {
    expect(
      appointmentWriteResponseSchema.parse({ ...response, reportId: null }).reportId,
    ).toBeNull();
  });
});
