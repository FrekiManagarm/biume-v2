import { describe, expect, it, vi } from "vitest";

import { createMobileApiApp, type MobileApiPorts } from "./mobile-api";

function createPorts(): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    listAppointments: vi.fn(async () => ({ items: [], nextCursor: null })),
    listCaptures: vi.fn(async () => ({ items: [], nextCursor: null })),
    createCapture: vi.fn(),
    createUploadSession: vi.fn(),
    completeCapture: vi.fn(),
    cancelCapture: vi.fn(),
  } as unknown as MobileApiPorts;
}

const document = createMobileApiApp(createPorts()).getOpenAPI31Document({
  openapi: "3.1.0",
  info: { title: "Biume API mobile", version: "1" },
});

describe("application Hono de l'api mobile", () => {
  it("décrit chaque endpoint servi", () => {
    expect(Object.keys(document.paths ?? {}).sort()).toEqual([
      "/api/mobile/v1/appointments",
      "/api/mobile/v1/appointments/{appointmentId}/move",
      "/api/mobile/v1/captures",
      "/api/mobile/v1/captures/{captureId}",
      "/api/mobile/v1/captures/{captureId}/complete",
      "/api/mobile/v1/captures/{captureId}/upload-session",
      "/api/mobile/v1/owners",
      "/api/mobile/v1/patients",
      "/api/mobile/v1/patients/{patientId}/history",
      "/api/mobile/v1/session",
    ]);
  });

  it("déclare le jeton porteur comme schéma de sécurité", () => {
    expect(document.components?.securitySchemes?.bearerAuth).toMatchObject({
      type: "http",
      scheme: "bearer",
    });
  });

  /**
   * Le client Dart génère sa gestion d'erreur depuis la spécification. Une
   * réponse d'erreur non décrite deviendrait un cas non traité sur le terrain.
   */
  it("décrit la réponse d'erreur sur chaque endpoint", () => {
    for (const [path, item] of Object.entries(document.paths ?? {})) {
      for (const [method, operation] of Object.entries(item as object)) {
        const responses = (operation as { responses?: object }).responses ?? {};
        const codes = Object.keys(responses);

        expect(
          codes.some((code) => code.startsWith("4") || code.startsWith("5")),
          `${method.toUpperCase()} ${path} ne décrit aucune réponse d'erreur`,
        ).toBe(true);
      }
    }
  });
});
