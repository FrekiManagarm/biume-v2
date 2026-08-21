import {
  mobileOwnersResponseSchema,
  mobilePatientHistoryResponseSchema,
  mobilePatientsResponseSchema,
} from "@biume/contracts/mobile-records";
import { describe, expect, it, vi } from "vitest";

import { createMobileApiHandler, type MobileApiPorts } from "./mobile-api";

const owner = {
  id: "client-1",
  name: "Camille Roux",
  email: null,
  phone: null,
  city: null,
  patientCount: 1,
};

const patient = {
  id: "pet-1",
  ownerId: "client-1",
  ownerName: "Camille Roux",
  name: "Filou",
  species: "DOG" as const,
  breed: null,
  birthDate: null,
  lastAppointmentAt: null,
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    listOwners: vi.fn(async () => ({ items: [owner], nextCursor: null })),
    listPatients: vi.fn(async () => ({ items: [patient], nextCursor: null })),
    getPatientHistory: vi.fn(async () => ({ items: [], nextCursor: null })),
    listAppointments: vi.fn(async () => ({ items: [], nextCursor: null })),
    listCaptures: vi.fn(async () => ({ items: [], nextCursor: null })),
    createCapture: vi.fn(),
    createUploadSession: vi.fn(),
    completeCapture: vi.fn(),
    cancelCapture: vi.fn(),
    createOwner: vi.fn(),
    createPatient: vi.fn(),
    moveAppointment: vi.fn(),
    ...overrides,
  } as unknown as MobileApiPorts;
}

function get(path: string) {
  return new Request(`https://biume.test/api/mobile/v1${path}`, {
    headers: { authorization: "Bearer jeton" },
  });
}

describe("lecture des fiches", () => {
  it("retourne les propriétaires au format du contrat", async () => {
    const response = await createMobileApiHandler(createPorts())(get("/owners"));

    expect(response.status).toBe(200);
    expect(
      mobileOwnersResponseSchema.parse(await response.json()).items,
    ).toHaveLength(1);
  });

  it("retourne les animaux au format du contrat", async () => {
    const response = await createMobileApiHandler(createPorts())(
      get("/patients"),
    );

    expect(response.status).toBe(200);
    expect(
      mobilePatientsResponseSchema.parse(await response.json()).items,
    ).toHaveLength(1);
  });

  it("transmet le filtre par propriétaire au port", async () => {
    const ports = createPorts();
    await createMobileApiHandler(ports)(get("/patients?ownerId=client-1"));

    expect(ports.listPatients).toHaveBeenCalledWith(
      { practitionerId: "user-1", organizationId: "org-1" },
      expect.objectContaining({ ownerId: "client-1" }),
    );
  });

  /**
   * Une limite non bornée transformerait un cabinet chargé en lecture massive.
   * Elle est ramenée à la borne, jamais refusée : un client qui demande trop
   * reçoit simplement la page bornée.
   */
  it("borne la taille de page demandée", async () => {
    const ports = createPorts();
    await createMobileApiHandler(ports)(get("/owners?limit=5000"));

    expect(ports.listOwners).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ limit: 50 }),
    );
  });

  it("retourne l'historique d'un animal", async () => {
    const response = await createMobileApiHandler(createPorts())(
      get("/patients/pet-1/history"),
    );

    expect(response.status).toBe(200);
    expect(
      mobilePatientHistoryResponseSchema.parse(await response.json()),
    ).toBeTruthy();
  });

  it("refuse une session sans organisation active", async () => {
    const ports = createPorts({
      authenticate: vi.fn(async () => ({
        userId: "user-1",
        organization: null,
      })),
    });
    const response = await createMobileApiHandler(ports)(get("/owners"));

    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe("active_organization_required");
  });

  it("refuse une requête sans session", async () => {
    const ports = createPorts({ authenticate: vi.fn(async () => null) });
    const response = await createMobileApiHandler(ports)(get("/owners"));

    expect(response.status).toBe(401);
  });
});

function post(path: string, body: unknown) {
  return new Request(`https://biume.test/api/mobile/v1${path}`, {
    method: "POST",
    headers: {
      authorization: "Bearer jeton",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("création de fiches", () => {
  it("crée un propriétaire à partir du seul nom", async () => {
    const ports = createPorts({ createOwner: vi.fn(async () => owner) });
    const response = await createMobileApiHandler(ports)(
      post("/owners", { name: "Camille Roux" }),
    );

    expect(response.status).toBe(201);
    expect(ports.createOwner).toHaveBeenCalledWith(
      { practitionerId: "user-1", organizationId: "org-1" },
      { name: "Camille Roux" },
    );
  });

  it("rejette un propriétaire sans nom", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/owners", { name: "   " }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("validation");
  });

  /**
   * Le client ne décide jamais du locataire. Un `organizationId` transmis est
   * une charge rejetée, jamais un champ silencieusement ignoré.
   */
  it("rejette une charge qui tente de choisir son organisation", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/owners", { name: "Camille Roux", organizationId: "org-2" }),
    );

    expect(response.status).toBe(400);
  });

  it("crée un animal avec le minimum de terrain", async () => {
    const ports = createPorts({ createPatient: vi.fn(async () => patient) });
    const response = await createMobileApiHandler(ports)(
      post("/patients", { ownerId: "client-1", name: "Filou", species: "DOG" }),
    );

    expect(response.status).toBe(201);
  });

  it("rejette un animal dont l'espèce est inconnue", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/patients", {
        ownerId: "client-1",
        name: "Filou",
        species: "DRAGON",
      }),
    );

    expect(response.status).toBe(400);
  });
});
