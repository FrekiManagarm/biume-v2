import {
  captureResponseSchema,
  mobileApiErrorSchema,
  mobileAppointmentsResponseSchema,
  mobileCapturesResponseSchema,
  mobileSessionResponseSchema,
  uploadSessionResponseSchema,
} from "@biume/contracts/capture";
import { describe, expect, it, vi } from "vitest";
import { CaptureServiceError } from "./capture.service";
import {
  createMobileApiHandler,
  mobileAgendaMaxWindowMs,
  mobileAgendaMaxLimit,
  type MobileApiPorts,
} from "./mobile-api";

const captureId = "6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70";
const sha256 = "a".repeat(64);

const captureResponse = {
  id: captureId,
  organizationId: "org-1",
  practitionerId: "user-1",
  appointmentId: null,
  patientId: null,
  reportId: null,
  durationMs: 120_000,
  mimeType: "audio/mp4" as const,
  byteSize: 1_048_576,
  sha256,
  objectKey: `captures/9f86d081884c7d65/${captureId}/audio.m4a`,
  objectEtag: null,
  status: "pending_upload" as const,
  attemptCount: 0,
  lastErrorCode: null,
  createdAt: "2026-07-19T10:00:00.000Z",
  uploadedAt: null,
  expiresAt: "2026-07-20T10:00:00.000Z",
  purgedAt: null,
};

const appointment = {
  id: "appointment-1",
  patientId: "pet-1",
  patientName: "Nala",
  animalType: "DOG" as const,
  beginAt: "2026-07-19T09:00:00.000Z",
  endAt: "2026-07-19T09:45:00.000Z",
  status: "COMPLETED" as const,
};

const createBody = {
  id: captureId,
  appointmentId: null,
  durationMs: 120_000,
  mimeType: "audio/mp4",
  byteSize: 1_048_576,
  sha256,
  createdAt: "2026-07-19T09:59:00.000Z",
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    listAppointments: vi.fn(async () => ({
      items: [appointment],
      nextCursor: null,
    })),
    listCaptures: vi.fn(async () => ({
      items: [captureResponse],
      nextCursor: null,
    })),
    createCapture: vi.fn(async () => captureResponse),
    createUploadSession: vi.fn(async () => ({
      method: "PUT" as const,
      url: "https://storage.example.com/signed",
      headers: { "content-type": "audio/mp4" },
      expiresAt: "2026-07-19T10:10:00.000Z",
    })),
    completeCapture: vi.fn(async () => ({
      ...captureResponse,
      status: "uploaded" as const,
      objectEtag: '"etag-1"',
      uploadedAt: "2026-07-19T10:05:00.000Z",
    })),
    cancelCapture: vi.fn(async () => {}),
    attachCapture: vi.fn(async () => captureResponse),
    extractCapture: vi.fn(async () => ({ captureId, reportId: "report-1" })),
    // Ports des fiches, ajoutés avec les endpoints métier. Ce fichier ne les
    // exerce pas : ils sont couverts par `mobile-api.records.test.ts`.
    listOwners: vi.fn(async () => ({ items: [], nextCursor: null })),
    listPatients: vi.fn(async () => ({ items: [], nextCursor: null })),
    getPatientHistory: vi.fn(async () => ({ items: [], nextCursor: null })),
    createOwner: vi.fn(),
    updateOwnerEmail: vi.fn(),
    createPatient: vi.fn(),
    moveAppointment: vi.fn(),
    getTranscript: vi.fn(async () => null),
    correctTranscript: vi.fn(),
    getReportProposals: vi.fn(async () => null),
    decideProposal: vi.fn(),
    decideSection: vi.fn(),
    regenerateProposals: vi.fn(),
    finalizeReport: vi.fn(),
    scheduleFollowUp: vi.fn(),
    listActionableFollowUps: vi.fn(async () => ({ items: [], nextCursor: null })),
    markFollowUpHandled: vi.fn(),
    listTodo: vi.fn(async () => ({ items: [] })),
    ...overrides,
  };
}

function request(
  method: string,
  path: string,
  body?: unknown,
  init: RequestInit = {},
) {
  return new Request(`https://app.biume.test${path}`, {
    method,
    ...(body === undefined
      ? {}
      : {
          body: typeof body === "string" ? body : JSON.stringify(body),
          headers: { "content-type": "application/json" },
        }),
    ...init,
  });
}

async function json(response: Response) {
  return (await response.json()) as unknown;
}

describe("authentication and tenancy", () => {
  it("rejects an unauthenticated request", async () => {
    const handler = createMobileApiHandler(
      createPorts({ authenticate: vi.fn(async () => null) }),
    );

    const response = await handler(request("GET", "/api/mobile/v1/session"));

    expect(response.status).toBe(401);
    expect(mobileApiErrorSchema.parse(await json(response)).code).toBe(
      "unauthorized",
    );
  });

  it("asks the practitioner to pick an organization before capturing", async () => {
    const handler = createMobileApiHandler(
      createPorts({
        authenticate: vi.fn(async () => ({
          userId: "user-1",
          organization: null,
        })),
      }),
    );

    const response = await handler(request("GET", "/api/mobile/v1/captures"));

    expect(response.status).toBe(409);
    expect(mobileApiErrorSchema.parse(await json(response)).code).toBe(
      "active_organization_required",
    );
  });

  it("still answers the session route without an active organization", async () => {
    const handler = createMobileApiHandler(
      createPorts({
        authenticate: vi.fn(async () => ({
          userId: "user-1",
          organization: null,
        })),
      }),
    );

    const response = await handler(request("GET", "/api/mobile/v1/session"));

    expect(response.status).toBe(200);
    expect(mobileSessionResponseSchema.parse(await json(response))).toEqual({
      userId: "user-1",
      organization: null,
      canUploadCaptures: false,
    });
  });

  it("builds the actor from the session, never from the request", async () => {
    const ports = createPorts();
    const handler = createMobileApiHandler(ports);

    await handler(request("POST", "/api/mobile/v1/captures", createBody));

    expect(ports.createCapture).toHaveBeenCalledWith(
      { practitionerId: "user-1", organizationId: "org-1" },
      expect.objectContaining({ id: captureId }),
    );
  });

  it("refuses a body that tries to choose its own organization", async () => {
    const ports = createPorts();
    const handler = createMobileApiHandler(ports);

    const response = await handler(
      request("POST", "/api/mobile/v1/captures", {
        ...createBody,
        organizationId: "org-2",
      }),
    );

    expect(response.status).toBe(400);
    expect(mobileApiErrorSchema.parse(await json(response)).code).toBe(
      "validation",
    );
    expect(ports.createCapture).not.toHaveBeenCalled();
  });
});

describe("session route", () => {
  it("reports an organization that can upload", async () => {
    const handler = createMobileApiHandler(createPorts());

    const response = await handler(request("GET", "/api/mobile/v1/session"));

    expect(mobileSessionResponseSchema.parse(await json(response))).toEqual({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
      canUploadCaptures: true,
    });
  });
});

describe("agenda route", () => {
  it("returns only the fields the capture screen needs", async () => {
    const handler = createMobileApiHandler(createPorts());

    const response = await handler(
      request("GET", "/api/mobile/v1/appointments"),
    );

    expect(response.status).toBe(200);
    expect(
      mobileAppointmentsResponseSchema.parse(await json(response)).items,
    ).toEqual([appointment]);
  });

  it("refuses a window wider than the bounded agenda", async () => {
    const ports = createPorts();
    const handler = createMobileApiHandler(ports);

    const response = await handler(
      request(
        "GET",
        "/api/mobile/v1/appointments?from=2026-01-01T00:00:00.000Z&to=2026-06-01T00:00:00.000Z",
      ),
    );

    expect(response.status).toBe(400);
    expect(ports.listAppointments).not.toHaveBeenCalled();
  });

  it("accepts a window at the boundary", async () => {
    const ports = createPorts();
    const handler = createMobileApiHandler(ports);
    const from = new Date("2026-07-01T00:00:00.000Z");
    const to = new Date(from.getTime() + mobileAgendaMaxWindowMs);

    const response = await handler(
      request(
        "GET",
        `/api/mobile/v1/appointments?from=${from.toISOString()}&to=${to.toISOString()}`,
      ),
    );

    expect(response.status).toBe(200);
  });

  it("never asks the database for more rows than the page size", async () => {
    const ports = createPorts();
    const handler = createMobileApiHandler(ports);

    await handler(request("GET", "/api/mobile/v1/appointments?limit=500"));

    expect(ports.listAppointments).toHaveBeenCalledWith(
      { practitionerId: "user-1", organizationId: "org-1" },
      expect.objectContaining({ limit: mobileAgendaMaxLimit }),
    );
  });

  it("forwards the cursor untouched", async () => {
    const ports = createPorts();
    const handler = createMobileApiHandler(ports);

    await handler(
      request("GET", "/api/mobile/v1/appointments?cursor=opaque-cursor"),
    );

    expect(ports.listAppointments).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ cursor: "opaque-cursor" }),
    );
  });

  it("refuses to serve an agenda row carrying owner contact details", async () => {
    const handler = createMobileApiHandler(
      createPorts({
        listAppointments: vi.fn(async () => ({
          items: [{ ...appointment, ownerEmail: "camille@example.com" }],
          nextCursor: null,
        })) as never,
      }),
    );

    const response = await handler(
      request("GET", "/api/mobile/v1/appointments"),
    );

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("camille@example.com");
  });
});

describe("capture routes", () => {
  it("lists the practitioner's captures", async () => {
    const handler = createMobileApiHandler(createPorts());

    const response = await handler(request("GET", "/api/mobile/v1/captures"));

    expect(response.status).toBe(200);
    expect(
      mobileCapturesResponseSchema.parse(await json(response)).items,
    ).toHaveLength(1);
  });

  it("creates a capture and answers with the contract shape", async () => {
    const handler = createMobileApiHandler(createPorts());

    const response = await handler(
      request("POST", "/api/mobile/v1/captures", createBody),
    );

    expect(response.status).toBe(201);
    expect(captureResponseSchema.parse(await json(response)).id).toBe(
      captureId,
    );
  });

  it("issues an upload session", async () => {
    const ports = createPorts();
    const handler = createMobileApiHandler(ports);

    const response = await handler(
      request("POST", `/api/mobile/v1/captures/${captureId}/upload-session`),
    );

    expect(response.status).toBe(200);
    expect(uploadSessionResponseSchema.parse(await json(response)).method).toBe(
      "PUT",
    );
    expect(ports.createUploadSession).toHaveBeenCalledWith(
      expect.anything(),
      captureId,
    );
  });

  it("confirms a capture", async () => {
    const handler = createMobileApiHandler(createPorts());

    const response = await handler(
      request("POST", `/api/mobile/v1/captures/${captureId}/complete`, {
        etag: '"etag-1"',
      }),
    );

    expect(response.status).toBe(200);
    expect(captureResponseSchema.parse(await json(response)).status).toBe(
      "uploaded",
    );
  });

  it("refuses a confirmation without an etag", async () => {
    const ports = createPorts();
    const handler = createMobileApiHandler(ports);

    const response = await handler(
      request("POST", `/api/mobile/v1/captures/${captureId}/complete`, {}),
    );

    expect(response.status).toBe(400);
    expect(ports.completeCapture).not.toHaveBeenCalled();
  });

  it("cancels a capture", async () => {
    const ports = createPorts();
    const handler = createMobileApiHandler(ports);

    const response = await handler(
      request("DELETE", `/api/mobile/v1/captures/${captureId}`),
    );

    expect(response.status).toBe(204);
    expect(ports.cancelCapture).toHaveBeenCalledWith(
      expect.anything(),
      captureId,
    );
  });

  it("rejects a capture id that is not a UUID", async () => {
    const ports = createPorts();
    const handler = createMobileApiHandler(ports);

    const response = await handler(
      request("DELETE", "/api/mobile/v1/captures/not-a-uuid"),
    );

    expect(response.status).toBe(400);
    expect(ports.cancelCapture).not.toHaveBeenCalled();
  });

  it("maps another organization's capture to a not found response", async () => {
    const handler = createMobileApiHandler(
      createPorts({
        createUploadSession: vi.fn(async () => {
          throw new CaptureServiceError("not_found", "capture_not_found");
        }),
      }),
    );

    const response = await handler(
      request("POST", `/api/mobile/v1/captures/${captureId}/upload-session`),
    );

    expect(response.status).toBe(404);
    expect(mobileApiErrorSchema.parse(await json(response)).code).toBe(
      "not_found",
    );
  });

  it("marks a failed confirmation as retryable", async () => {
    const handler = createMobileApiHandler(
      createPorts({
        completeCapture: vi.fn(async () => {
          throw new CaptureServiceError("object_incomplete", "object_missing", {
            retryable: true,
          });
        }),
      }),
    );

    const response = await handler(
      request("POST", `/api/mobile/v1/captures/${captureId}/complete`, {
        etag: '"etag-1"',
      }),
    );

    expect(response.status).toBe(409);
    expect(mobileApiErrorSchema.parse(await json(response)).retryable).toBe(
      true,
    );
  });
});

describe("dispatcher", () => {
  it("rejects malformed JSON", async () => {
    const handler = createMobileApiHandler(createPorts());

    const response = await handler(
      request("POST", "/api/mobile/v1/captures", "{not json"),
    );

    expect(response.status).toBe(400);
    expect(mobileApiErrorSchema.parse(await json(response)).code).toBe(
      "validation",
    );
  });

  it("answers 404 on an unknown path", async () => {
    const handler = createMobileApiHandler(createPorts());

    const response = await handler(request("GET", "/api/mobile/v1/unknown"));

    expect(response.status).toBe(404);
    expect(mobileApiErrorSchema.parse(await json(response)).code).toBe(
      "not_found",
    );
  });

  it("answers 405 on a method the route does not support", async () => {
    const handler = createMobileApiHandler(createPorts());

    const response = await handler(request("DELETE", "/api/mobile/v1/session"));

    expect(response.status).toBe(405);
    expect(mobileApiErrorSchema.parse(await json(response)).code).toBe(
      "method_not_allowed",
    );
  });

  it("never leaks an unexpected exception message", async () => {
    const handler = createMobileApiHandler(
      createPorts({
        listCaptures: vi.fn(async () => {
          throw new Error(
            'relation "audio_capture" does not exist at 10.0.0.4:5432',
          );
        }),
      }),
    );

    const response = await handler(request("GET", "/api/mobile/v1/captures"));
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).not.toContain("audio_capture");
    expect(body).not.toContain("10.0.0.4");
    expect(mobileApiErrorSchema.parse(JSON.parse(body)).code).toBe(
      "server_error",
    );
  });

  it("keeps every response out of any cache", async () => {
    const handler = createMobileApiHandler(createPorts());

    const response = await handler(request("GET", "/api/mobile/v1/session"));

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-type")).toContain("application/json");
  });
});
