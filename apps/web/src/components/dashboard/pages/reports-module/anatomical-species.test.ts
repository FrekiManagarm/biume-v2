import { describe, expect, it } from "vitest";

import {
  canOpenAnatomicalEntryShortcut,
  resolveAnatomicalAnimalType,
} from "./anatomical-species";

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

describe("canOpenAnatomicalEntryShortcut", () => {
  it.each([
    [null, false],
    [undefined, false],
    [{ code: null, name: null }, false],
    [{ code: "BIRD", name: "Perroquet" }, false],
    [{ code: "DOG", name: "Chien" }, true],
  ])("guards Shift+N for %o", (animal, expected) => {
    expect(canOpenAnatomicalEntryShortcut("anatomical", animal)).toBe(expected);
  });

  it("does not enable Shift+N outside entry tabs", () => {
    expect(
      canOpenAnatomicalEntryShortcut("recommendations", {
        code: "DOG",
      }),
    ).toBe(false);
  });
});
