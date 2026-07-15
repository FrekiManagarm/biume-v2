import { describe, expect, test } from "vitest";

import {
  emptyClientFormValues,
  getClientDeletionDescription,
  getClientFormValues,
  getPageAfterDeletion,
  getPageAfterEntityRemoval,
  getPatientDeletionDescription,
  getPatientDisplayName,
  getPatientFormValues,
  getPatientMutationValues,
  isStaleClientError,
  isStaleEntityError,
  isStalePatientError,
} from "./entity-list.helpers";

describe("getClientDeletionDescription", () => {
  test.each([
    [0, ["aucun patient"]],
    [1, ["1 patient"]],
    [3, ["3 patients", "données associées"]],
  ])(
    "describes the irreversible cascade for %i attached patients",
    (patientCount, expectedFragments) => {
      const description = getClientDeletionDescription(patientCount);

      for (const fragment of expectedFragments) {
        expect(description).toContain(fragment);
      }
    },
  );
});

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

  test("returns a fresh copy of the empty values for a null client", () => {
    const values = getClientFormValues(null);

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

  test("uses the current first client and animal for a new patient", () => {
    expect(
      getPatientFormValues(null, {
        ownerId: "client-1",
        type: "animal-1",
      }),
    ).toEqual({
      name: "",
      ownerId: "client-1",
      type: "animal-1",
      breed: "",
      gender: "Male",
      birthDate: "",
      weight: 0,
      height: 0,
      description: "",
    });
  });
});

describe("patient action helpers", () => {
  test("warns explicitly that deleting a patient is permanent", () => {
    const description = getPatientDeletionDescription();

    expect(description).toContain("action est irréversible");
    expect(description).toContain("dossier patient");
    expect(description).toContain("données");
    expect(description).toContain("définitivement");
  });

  test("normalizes blank patient names for labels", () => {
    expect(getPatientDisplayName("   ")).toBe("Patient sans nom");
    expect(getPatientDisplayName("  Nala  ")).toBe("Nala");
  });

  test("serializes the birth date at local noon and omits blank notes", () => {
    const values = getPatientMutationValues({
      name: "Nala",
      ownerId: "client-1",
      type: "animal-1",
      breed: "Européen",
      gender: "Female",
      birthDate: "2024-06-09",
      weight: 4,
      height: 25,
      description: "   ",
    });

    expect(values.birthDate).toEqual(new Date(2024, 5, 9, 12));
    expect(values.description).toBeUndefined();
  });

  test("builds an edit payload with the matching patient id", () => {
    const values = getPatientMutationValues(
      {
        name: "Nala",
        ownerId: "client-1",
        type: "animal-1",
        breed: "Européen",
        gender: "Female",
        birthDate: "2024-06-09",
        weight: 4,
        height: 25,
        description: "À surveiller",
      },
      "patient-1",
    );

    expect(values).toMatchObject({
      id: "patient-1",
      name: "Nala",
      description: "À surveiller",
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

describe("getPageAfterEntityRemoval", () => {
  test.each([
    [3, ["A"], "A", 2],
    [3, [], "A", 2],
    [3, ["B"], "A", 3],
    [3, ["A", "B"], "A", 3],
    [1, [], "A", 1],
  ])(
    "resolves page %i with visible ids %j after removing %s",
    (currentPage, visibleIds, removedId, expectedPage) => {
      expect(
        getPageAfterEntityRemoval(currentPage, visibleIds, removedId),
      ).toBe(expectedPage);
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
    expect(
      isStaleEntityError(
        new Error("Propriétaire introuvable ou inaccessible."),
      ),
    ).toBe(false);
    expect(isStaleEntityError("introuvable ou inaccessible")).toBe(false);
  });

  test("distinguishes the missing patient from a missing owner", () => {
    expect(
      isStalePatientError(new Error("Patient introuvable ou inaccessible.")),
    ).toBe(true);
    expect(
      isStalePatientError(
        new Error("Propriétaire introuvable ou inaccessible."),
      ),
    ).toBe(false);
  });

  test("recognizes only a missing client in client flows", () => {
    expect(
      isStaleClientError(new Error("Client introuvable ou inaccessible.")),
    ).toBe(true);
    expect(
      isStaleClientError(new Error("Patient introuvable ou inaccessible.")),
    ).toBe(false);
  });
});
