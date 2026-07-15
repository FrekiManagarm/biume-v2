import { describe, expect, test } from "vitest";

import {
  emptyClientFormValues,
  getClientFormValues,
  getPageAfterDeletion,
  getPatientFormValues,
  isStaleEntityError,
} from "./entity-list.helpers";

describe("getClientFormValues", () => {
  test("normalizes nullable client fields to empty strings", () => {
    expect(
      getClientFormValues({
        name: null,
        email: "nala@example.com",
        phone: null,
        address: null,
        city: "Lyon",
        zip: null,
        country: null,
      }),
    ).toEqual({
      name: "",
      email: "nala@example.com",
      phone: "",
      address: "",
      city: "Lyon",
      zip: "",
      country: "",
    });
  });

  test("returns a fresh copy of the empty values when no client is provided", () => {
    const values = getClientFormValues();

    expect(values).toEqual(emptyClientFormValues);
    expect(values).not.toBe(emptyClientFormValues);
  });
});

describe("getPatientFormValues", () => {
  test("formats the birth date locally and normalizes nullable relations", () => {
    const birthDate = new Date(2024, 5, 9, 0, 30);

    expect(
      getPatientFormValues({
        name: "Nala",
        ownerId: null,
        type: null,
        breed: "Européen",
        gender: "Female",
        birthDate,
        weight: 4,
        height: 25,
        description: null,
      }),
    ).toEqual({
      name: "Nala",
      ownerId: "",
      type: "",
      breed: "Européen",
      gender: "Female",
      birthDate: "2024-06-09",
      weight: 4,
      height: 25,
      description: "",
    });
  });
});

describe("getPageAfterDeletion", () => {
  test.each([
    [3, 1, 2],
    [3, 2, 3],
    [1, 1, 1],
  ])(
    "returns page %i after deleting one of %i items from page %i",
    (currentPage, itemCount, expectedPage) => {
      expect(getPageAfterDeletion(currentPage, itemCount)).toBe(expectedPage);
    },
  );
});

describe("isStaleEntityError", () => {
  test("recognizes the stale entity message fragment on Error instances", () => {
    expect(
      isStaleEntityError(
        new Error("Ce patient est introuvable ou inaccessible."),
      ),
    ).toBe(true);
    expect(isStaleEntityError(new Error("Une autre erreur"))).toBe(false);
    expect(isStaleEntityError("introuvable ou inaccessible")).toBe(false);
  });
});
