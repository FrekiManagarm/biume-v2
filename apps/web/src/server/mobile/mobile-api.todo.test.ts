import { todoResponseSchema } from "@biume/contracts/mobile-todo";
import { describe, expect, it, vi } from "vitest";

import { createMobileApiHandler, type MobileApiPorts } from "./mobile-api";

const item = {
  kind: "to_attach" as const,
  captureId: "2f1e5c2e-4b7d-4a55-9d4a-1c0a8f5b9e11",
  reportId: null,
  appointmentId: null,
  patientName: null,
  updatedAt: "2026-09-03T10:00:00.000Z",
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    listTodo: vi.fn(async () => ({ items: [item] })),
    ...overrides,
  } as unknown as MobileApiPorts;
}

function todo(init: RequestInit = {}) {
  return new Request("https://biume.test/api/mobile/v1/todo", {
    method: "GET",
    headers: { authorization: "Bearer jeton" },
    ...init,
  });
}

describe("liste « à traiter »", () => {
  it("retourne les éléments validés par le contrat", async () => {
    const response = await createMobileApiHandler(createPorts())(todo());

    expect(response.status).toBe(200);
    expect(todoResponseSchema.parse(await response.json())).toEqual({
      items: [item],
    });
  });

  it("refuse toute autre méthode", async () => {
    const response = await createMobileApiHandler(createPorts())(
      todo({ method: "POST" }),
    );

    expect(response.status).toBe(405);
  });
});
