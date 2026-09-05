import { describe, expect, test } from "vitest";

import { deriveSessionState, sessionStateLabel } from "./session-state";

const now = new Date("2026-08-17T14:00:00.000Z");

describe("deriveSessionState", () => {
  test("une séance annulée le reste, même passée", () => {
    expect(
      deriveSessionState({
        status: "CANCELLED",
        endAt: new Date("2026-08-17T10:00:00.000Z"),
        now,
      }),
    ).toBe("cancelled");
  });

  test("une séance dont l'heure de fin est passée est terminée", () => {
    expect(
      deriveSessionState({
        status: "CREATED",
        endAt: new Date("2026-08-17T13:59:59.000Z"),
        now,
      }),
    ).toBe("done");
  });

  test("une séance qui se termine exactement maintenant est terminée", () => {
    expect(
      deriveSessionState({ status: "CONFIRMED", endAt: now, now }),
    ).toBe("done");
  });

  test("une séance à venir est prévue", () => {
    expect(
      deriveSessionState({
        status: "CREATED",
        endAt: new Date("2026-08-17T15:00:00.000Z"),
        now,
      }),
    ).toBe("scheduled");
  });

  test("un statut COMPLETED explicite prime sur l'heure", () => {
    expect(
      deriveSessionState({
        status: "COMPLETED",
        endAt: new Date("2026-08-17T15:00:00.000Z"),
        now,
      }),
    ).toBe("done");
  });
});

describe("sessionStateLabel", () => {
  test("CREATED et CONFIRMED se lisent tous deux « Prévu »", () => {
    expect(sessionStateLabel("scheduled")).toBe("Prévu");
  });

  test("les libellés sont en français métier", () => {
    expect(sessionStateLabel("done")).toBe("Terminé");
    expect(sessionStateLabel("cancelled")).toBe("Annulé");
  });
});
