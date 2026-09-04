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

  function buildItems(total: number) {
    return Array.from({ length: total }, (_, index) => ({
      kind: "to_attach" as const,
      captureId: `2f1e5c2e-4b7d-4a55-9d4a-1c0a8f5b${String(index).padStart(4, "0")}`,
      reportId: null,
      appointmentId: null,
      patientName: null,
      updatedAt: "2026-09-03T10:00:00.000Z",
    }));
  }

  it("accepte cent éléments", () => {
    expect(() =>
      todoResponseSchema.parse({ items: buildItems(100) }),
    ).not.toThrow();
  });

  it("refuse cent-un éléments", () => {
    expect(() =>
      todoResponseSchema.parse({ items: buildItems(101) }),
    ).toThrow();
  });
});
