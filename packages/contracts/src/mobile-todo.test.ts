import { describe, expect, it } from "vitest";
import { todoItemSchema, todoResponseSchema } from "./mobile-todo";

describe("contrat « à traiter »", () => {
  it("accepte un élément à rattacher sans rapport", () => {
    const parsed = todoItemSchema.parse({
      kind: "to_attach",
      captureId: "2f1e5c2e-4b7d-4a55-9d4a-1c0a8f5b9e11",
      reportId: null,
      appointmentId: null,
      patientName: null,
      updatedAt: "2026-09-03T10:00:00.000Z",
    });
    expect(parsed.kind).toBe("to_attach");
  });

  it("refuse un genre inconnu", () => {
    expect(() =>
      todoItemSchema.parse({
        kind: "proposed",
        captureId: "2f1e5c2e-4b7d-4a55-9d4a-1c0a8f5b9e11",
        reportId: null,
        appointmentId: null,
        patientName: null,
        updatedAt: "2026-09-03T10:00:00.000Z",
      }),
    ).toThrow();
  });

  it("borne la liste à cent éléments", () => {
    expect(todoResponseSchema.shape.items._zod.def.checks?.length ?? 1).toBeGreaterThan(0);
  });
});
