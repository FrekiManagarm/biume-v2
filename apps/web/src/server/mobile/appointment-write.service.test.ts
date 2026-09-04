import { describe, expect, it } from "vitest";

import { dayBounds, defaultDurationMs } from "./appointment-write.service";

describe("durée par défaut", () => {
  it("reprend la durée de la dernière séance", () => {
    expect(
      defaultDurationMs({
        beginAt: new Date("2026-09-01T10:00:00Z"),
        endAt: new Date("2026-09-01T10:45:00Z"),
      }),
    ).toBe(45 * 60 * 1000);
  });

  it("vaut une heure sans historique", () => {
    expect(defaultDurationMs(null)).toBe(60 * 60 * 1000);
  });

  it("vaut une heure si la dernière séance a une durée nulle ou négative", () => {
    const beginAt = new Date("2026-09-01T10:00:00Z");
    expect(defaultDurationMs({ beginAt, endAt: beginAt })).toBe(60 * 60 * 1000);
  });
});

describe("bornes du jour", () => {
  it("encadre la journée locale du créneau", () => {
    const { dayStart, dayEnd } = dayBounds(new Date("2026-09-03T14:30:00Z"));
    expect(dayEnd.getTime()).toBeGreaterThan(dayStart.getTime());
    expect(dayEnd.getTime() - dayStart.getTime()).toBeLessThan(25 * 60 * 60 * 1000);
  });
});
