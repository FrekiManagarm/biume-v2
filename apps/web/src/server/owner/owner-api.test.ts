import { describe, expect, it, vi } from "vitest";

import { createOwnerApiHandler, type OwnerApiPorts } from "./owner-api";

const token = "jeton-de-partage-opaque-suffisamment-long-pour-etre-realiste";

function createPorts(overrides: Partial<OwnerApiPorts> = {}): OwnerApiPorts {
  return {
    findShareLink: vi.fn(async () => ({
      token,
      ownerEmail: "camille@example.test",
      revokedAt: null,
    })),
    issueChallenge: vi.fn(async () => {}),
    verifyChallenge: vi.fn(async () => ({ sessionSecret: "secret-de-session" })),
    resolveSession: vi.fn(async () => ({ token })),
    loadSharedReport: vi.fn(async () => ({
      patientName: "Filou",
      createdAt: "2026-08-21T10:00:00.000Z",
      clinical: [],
      anatomical: [],
      recommendations: [],
    })),
    saveAnswer: vi.fn(async () => {}),
    ...overrides,
  } as unknown as OwnerApiPorts;
}

function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`https://biume.test/api/owner/v1${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function get(path: string, headers: Record<string, string> = {}) {
  return new Request(`https://biume.test/api/owner/v1${path}`, { headers });
}

describe("demande de code", () => {
  it("envoie un code pour un lien valide", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(`/${token}/challenge`, { deviceId: "appareil-1" }),
    );

    expect(response.status).toBe(200);
  });

  /**
   * La réponse est identique pour un lien valide et pour un lien inexistant.
   * Distinguer les deux transformerait l'API en oracle confirmant qu'un compte
   * rendu existe.
   */
  it("répond pareil pour un lien inexistant", async () => {
    const ports = createPorts({ findShareLink: vi.fn(async () => null) });
    const inexistant = await createOwnerApiHandler(ports)(
      post(`/${token}/challenge`, { deviceId: "appareil-1" }),
    );
    const valide = await createOwnerApiHandler(createPorts())(
      post(`/${token}/challenge`, { deviceId: "appareil-1" }),
    );

    expect(inexistant.status).toBe(valide.status);
    expect(await inexistant.text()).toBe(await valide.text());
  });

  it("répond pareil pour un lien révoqué", async () => {
    const ports = createPorts({
      findShareLink: vi.fn(async () => ({
        token,
        ownerEmail: "camille@example.test",
        revokedAt: new Date(),
      })),
    });
    const response = await createOwnerApiHandler(ports)(
      post(`/${token}/challenge`, { deviceId: "appareil-1" }),
    );

    expect(response.status).toBe(200);
  });

  it("n'émet pas de code pour un lien révoqué", async () => {
    const issueChallenge = vi.fn(async () => {});
    const ports = createPorts({
      issueChallenge,
      findShareLink: vi.fn(async () => ({
        token,
        ownerEmail: "camille@example.test",
        revokedAt: new Date(),
      })),
    });
    await createOwnerApiHandler(ports)(
      post(`/${token}/challenge`, { deviceId: "appareil-1" }),
    );

    expect(issueChallenge).not.toHaveBeenCalled();
  });

  it("ne renvoie jamais le code dans sa réponse", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(`/${token}/challenge`, { deviceId: "appareil-1" }),
    );

    expect(await response.text()).not.toMatch(/\d{6}/);
  });

  it("ne révèle pas l'adresse à qui le code est envoyé", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(`/${token}/challenge`, { deviceId: "appareil-1" }),
    );

    expect(await response.text()).not.toContain("camille@example.test");
  });
});

describe("vérification du code", () => {
  it("ouvre une session sur un code correct", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(`/${token}/verify`, { deviceId: "appareil-1", code: "123456" }),
    );

    expect(response.status).toBe(200);
    expect((await response.json()).sessionSecret).toBeTruthy();
  });

  it("refuse un code incorrect sans dire combien il en reste", async () => {
    const ports = createPorts({ verifyChallenge: vi.fn(async () => null) });
    const response = await createOwnerApiHandler(ports)(
      post(`/${token}/verify`, { deviceId: "appareil-1", code: "000000" }),
    );

    expect(response.status).toBe(401);
    const body = await response.text();
    expect(body).not.toMatch(/tentative|restant|\d\s*\/\s*5/i);
  });

  it("rejette un code qui n'a pas la bonne forme", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(`/${token}/verify`, { deviceId: "appareil-1", code: "abc" }),
    );

    expect(response.status).toBe(400);
  });
});

describe("lecture du compte rendu", () => {
  it("sert le rapport à une session valide", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      get(`/${token}/report`, { authorization: "Bearer secret-de-session" }),
    );

    expect(response.status).toBe(200);
    expect((await response.json()).patientName).toBe("Filou");
  });

  it("refuse sans session", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      get(`/${token}/report`),
    );

    expect(response.status).toBe(401);
  });

  /**
   * Une session ouverte sur un lien ne donne accès qu'à ce lien. Un
   * propriétaire qui a reçu trois comptes rendus a trois sessions.
   */
  it("refuse une session ouverte sur un autre lien", async () => {
    const ports = createPorts({
      resolveSession: vi.fn(async () => ({ token: "un-autre-jeton" })),
    });
    const response = await createOwnerApiHandler(ports)(
      get(`/${token}/report`, { authorization: "Bearer secret-de-session" }),
    );

    expect(response.status).toBe(401);
  });

  it("ne transporte aucune donnée du cabinet ni d'autre patient", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      get(`/${token}/report`, { authorization: "Bearer secret-de-session" }),
    );
    const body = JSON.stringify(await response.json());

    expect(body).not.toContain("organizationId");
    expect(body).not.toContain("practitionerId");
    expect(body).not.toContain("reportId");
  });
});

describe("réponse au questionnaire", () => {
  it("enregistre une réponse valide", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(
        `/${token}/answer`,
        { evolution: "worse", reaction: "Fatigue.", wantsContact: true },
        { authorization: "Bearer secret-de-session" },
      ),
    );

    expect(response.status).toBe(200);
  });

  it("refuse une réponse sans session", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(`/${token}/answer`, {
        evolution: "better",
        reaction: "",
        wantsContact: false,
      }),
    );

    expect(response.status).toBe(401);
  });

  it("rejette une évolution hors échelle", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(
        `/${token}/answer`,
        { evolution: "excellent", reaction: "", wantsContact: false },
        { authorization: "Bearer secret-de-session" },
      ),
    );

    expect(response.status).toBe(400);
  });
});
