import { extractCaptureResponseSchema } from "@biume/contracts/capture";
import { transcriptSchema } from "@biume/contracts/transcript";
import { describe, expect, it, vi } from "vitest";

import { createMobileApiHandler, type MobileApiPorts } from "./mobile-api";
import { MobileRequestError } from "./mobile-api.errors";

const captureId = "6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70";

const transcript = {
  captureId,
  status: "ready" as const,
  text: "Tension lombaire à droite.",
  language: "fr",
  provider: "openai:gpt-4o-transcribe",
  correctedAt: null,
  createdAt: "2026-08-21T10:00:00.000Z",
  updatedAt: "2026-08-21T10:00:30.000Z",
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    getTranscript: vi.fn(async () => transcript),
    correctTranscript: vi.fn(async () => ({
      ...transcript,
      status: "corrected" as const,
      text: "Tension lombaire droite.",
      correctedAt: "2026-08-21T10:05:00.000Z",
    })),
    extractCapture: vi.fn(async () => ({ captureId, reportId: "report-1" })),
    ...overrides,
  } as unknown as MobileApiPorts;
}

function request(method: "GET" | "POST", body?: unknown, id = captureId) {
  return new Request(
    `https://biume.test/api/mobile/v1/captures/${id}/transcript`,
    {
      method,
      headers: {
        authorization: "Bearer jeton",
        ...(body ? { "content-type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    },
  );
}

function post(path: string, body: unknown) {
  return new Request(`https://biume.test/api/mobile/v1${path}`, {
    method: "POST",
    headers: { authorization: "Bearer jeton", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("lecture de la transcription", () => {
  it("retourne la transcription au format du contrat", async () => {
    const response = await createMobileApiHandler(createPorts())(
      request("GET"),
    );

    expect(response.status).toBe(200);
    expect(transcriptSchema.parse(await response.json())).toEqual(transcript);
  });

  it("retourne 404 quand la dictée n'a pas de transcription", async () => {
    const ports = createPorts({ getTranscript: vi.fn(async () => null) });
    const response = await createMobileApiHandler(ports)(request("GET"));

    expect(response.status).toBe(404);
  });

  it("rejette un identifiant de capture qui n'est pas un UUID", async () => {
    const response = await createMobileApiHandler(createPorts())(
      request("GET", undefined, "pas-un-uuid"),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("validation");
  });

  /**
   * La transcription ne transporte jamais la clé d'objet ni l'URL signée : le
   * client la mettrait en cache local, et l'audio doit rester inatteignable.
   */
  it("ne transporte ni clé d'objet ni URL", async () => {
    const response = await createMobileApiHandler(createPorts())(
      request("GET"),
    );
    const body = JSON.stringify(await response.json());

    expect(body).not.toContain("objectKey");
    expect(body).not.toContain("http");
  });
});

describe("correction de la transcription", () => {
  it("enregistre la correction et retourne l'état corrigé", async () => {
    const response = await createMobileApiHandler(createPorts())(
      request("POST", { text: "Tension lombaire droite." }),
    );

    expect(response.status).toBe(200);
    const parsed = transcriptSchema.parse(await response.json());
    expect(parsed.status).toBe("corrected");
    expect(parsed.correctedAt).not.toBeNull();
  });

  it("accepte un texte vidé par le praticien", async () => {
    const response = await createMobileApiHandler(createPorts())(
      request("POST", { text: "" }),
    );

    expect(response.status).toBe(200);
  });

  it("rejette un champ non déclaré", async () => {
    const response = await createMobileApiHandler(createPorts())(
      request("POST", { text: "ok", status: "ready" }),
    );

    expect(response.status).toBe(400);
  });

  it("traduit une transcription encore en cours en conflit", async () => {
    const ports = createPorts({
      correctTranscript: vi.fn(async () => {
        throw new MobileRequestError("conflict");
      }),
    });
    const response = await createMobileApiHandler(ports)(
      request("POST", { text: "ok" }),
    );

    expect(response.status).toBe(409);
    expect((await response.json()).retryable).toBe(false);
  });
});

describe("validation de la transcription", () => {
  it("lance l'extraction et renvoie le rapport visé", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post(`/captures/${captureId}/extract`, {}),
    );
    expect(response.status).toBe(200);
    expect(extractCaptureResponseSchema.parse(await response.json()).reportId).toBe("report-1");
  });

  it("refuse une capture sans rapport", async () => {
    const response = await createMobileApiHandler(
      createPorts({
        extractCapture: vi.fn(async () => {
          throw new MobileRequestError("conflict");
        }),
      }),
    )(post(`/captures/${captureId}/extract`, {}));
    expect(response.status).toBe(409);
  });
});
