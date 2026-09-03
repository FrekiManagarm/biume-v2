import { captureResponseSchema } from "@biume/contracts/capture";
import { describe, expect, it, vi } from "vitest";

import { createMobileApiHandler, type MobileApiPorts } from "./mobile-api";
import { MobileRequestError } from "./mobile-api.errors";

const captureId = "2f1e5c2e-4b7d-4a55-9d4a-1c0a8f5b9e11";

const capture = {
  id: captureId,
  organizationId: "org-1",
  practitionerId: "user-1",
  appointmentId: null,
  patientId: "pet-1",
  reportId: "report-1",
  durationMs: 12_000,
  mimeType: "audio/mp4" as const,
  byteSize: 4_096,
  sha256: "a".repeat(64),
  status: "uploaded" as const,
  attemptCount: 1,
  lastErrorCode: null,
  createdAt: "2026-09-03T09:00:00.000Z",
  uploadedAt: "2026-09-03T09:01:00.000Z",
  expiresAt: "2026-09-04T09:00:00.000Z",
  purgedAt: null,
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    attachCapture: vi.fn(async () => capture),
    ...overrides,
  } as unknown as MobileApiPorts;
}

function post(path: string, body: unknown) {
  return new Request(`https://biume.test/api/mobile/v1${path}`, {
    method: "POST",
    headers: { authorization: "Bearer jeton", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("rattachement d'une capture libre", () => {
  it("renvoie la capture avec son animal et son rapport", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post(`/captures/${captureId}/attach`, { patientId: "pet-1" }),
    );

    expect(response.status).toBe(200);
    const body = captureResponseSchema.parse(await response.json());
    expect(body.reportId).toBe("report-1");
    expect(ports.attachCapture).toHaveBeenCalledWith(
      { practitionerId: "user-1", organizationId: "org-1" },
      captureId,
      { patientId: "pet-1" },
    );
  });

  it("refuse un corps sans animal", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post(`/captures/${captureId}/attach`, {}),
    );
    expect(response.status).toBe(400);
  });

  it("traduit un rattachement contradictoire en conflit", async () => {
    const response = await createMobileApiHandler(
      createPorts({
        attachCapture: vi.fn(async () => {
          throw new MobileRequestError("conflict");
        }),
      }),
    )(post(`/captures/${captureId}/attach`, { patientId: "pet-2" }));
    expect(response.status).toBe(409);
  });
});
