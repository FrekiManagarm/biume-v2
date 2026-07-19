import { describe, expect, it } from "vitest";

import { resolveAnatomicalAnimalType } from "./anatomical-species";

describe("resolveAnatomicalAnimalType", () => {
  it.each([
    [{ code: "DOG", name: "Chien" }, "DOG"],
    [{ code: "cat", name: "Chat" }, "CAT"],
    [{ code: "HORSE", name: "Cheval" }, "HORSE"],
    [{ code: null, name: "Chien" }, "DOG"],
  ] as const)("resolves a supported explicit species", (animal, expected) => {
    expect(resolveAnatomicalAnimalType(animal)).toBe(expected);
  });

  it.each([null, undefined, {}, { code: null, name: null }, { name: "NAC" }])(
    "never infers dog for an absent or unsupported species",
    (animal) => {
      expect(resolveAnatomicalAnimalType(animal)).toBeNull();
    },
  );
});
