import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { deletePatientSchema, updatePatientSchema } from "./patients.schema";

const validPatientUpdate = {
  id: "patient-1",
  name: "Moka",
  ownerId: "client-1",
  type: "cat",
  breed: "Européen",
  gender: "Female" as const,
  birthDate: "2022-04-15",
  weight: 4,
  height: 25,
};

describe("patient mutation schemas", () => {
  test("accepts a complete valid patient update", () => {
    expect(updatePatientSchema.safeParse(validPatientUpdate).success).toBe(
      true,
    );
  });

  test("accepts Date and number values used by the patient UI", () => {
    expect(
      updatePatientSchema.safeParse({
        ...validPatientUpdate,
        birthDate: new Date("2022-04-15"),
        weight: 4,
        height: 25,
      }).success,
    ).toBe(true);
  });

  test.each([
    ["birthDate", null],
    ["birthDate", true],
    ["birthDate", " "],
    ["weight", null],
    ["weight", true],
    ["weight", " "],
    ["height", null],
    ["height", false],
    ["height", " "],
  ])("rejects an invalid %s update value: %o", (field, value) => {
    expect(
      updatePatientSchema.safeParse({
        ...validPatientUpdate,
        [field]: value,
      }).success,
    ).toBe(false);
  });

  test("distinguishes an absent chip number from an explicit null", () => {
    const absentChip = updatePatientSchema.parse(validPatientUpdate);
    const clearedChip = updatePatientSchema.parse({
      ...validPatientUpdate,
      chippedNumber: null,
    });

    expect(absentChip).not.toHaveProperty("chippedNumber");
    expect(clearedChip.chippedNumber).toBeNull();
  });

  test.each([123456, "123456"])(
    "accepts a positive chip number: %o",
    (chippedNumber) => {
      expect(
        updatePatientSchema.safeParse({
          ...validPatientUpdate,
          chippedNumber,
        }).success,
      ).toBe(true);
    },
  );

  test.each([true, " ", 0, -1, "0"])(
    "rejects an invalid chip number: %o",
    (chippedNumber) => {
      expect(
        updatePatientSchema.safeParse({
          ...validPatientUpdate,
          chippedNumber,
        }).success,
      ).toBe(false);
    },
  );

  test.each([
    { ...validPatientUpdate, id: "" },
    { ...validPatientUpdate, ownerId: "" },
  ])("rejects an update with an empty required id: %o", (input) => {
    expect(updatePatientSchema.safeParse(input).success).toBe(false);
  });

  test("accepts only non-empty patient ids for deletion", () => {
    expect(deletePatientSchema.safeParse({ id: "patient-1" }).success).toBe(
      true,
    );
    expect(deletePatientSchema.safeParse({ id: "" }).success).toBe(false);
  });
});

describe("patient mutation authorization", () => {
  test("scopes list, lookup, update, and delete operations to the organization", () => {
    const source = readFileSync(
      new URL("./patients.function.ts", import.meta.url),
      "utf8",
    );
    const organizationScopeCount = (
      source.match(/eq\(pets\.organizationId, organizationId\)/g) ?? []
    ).length;
    const updateSource = source.slice(
      source.indexOf("export const updatePatient"),
      source.indexOf("export const deletePatient"),
    );
    const createSource = source.slice(
      source.indexOf("export const createPatient"),
      source.indexOf("export const updatePatient"),
    );
    const deleteSource = source.slice(
      source.indexOf("export const deletePatient"),
      source.indexOf("export const getPatientById"),
    );

    expect(organizationScopeCount).toBeGreaterThanOrEqual(3);
    expect(source).toContain("eq(clients.organizationId, organizationId)");
    expect(source).toContain("Propriétaire introuvable ou inaccessible.");
    expect(source).toContain("Patient introuvable ou inaccessible.");
    expect(createSource).toContain(
      "eq(clients.organizationId, organizationId)",
    );
    expect(createSource).toContain("createPatientWithOwnerIsolation");
    expect(deleteSource).toContain("eq(pets.organizationId, organizationId)");
    expect(deleteSource).toContain("deletePatientWithDependencyIsolation");
    expect(deleteSource).toContain("appointments");
    expect(deleteSource).toContain("reports");
    expect(deleteSource).toContain("medicalDocuments");
    expect(deleteSource).toContain("appointmentId: true");
    expect(deleteSource).toContain("patientId: true");
    expect(updateSource).toMatch(
      /chippedNumber:\s*data\.chippedNumber === undefined\s*\?\s*undefined\s*:\s*data\.chippedNumber/,
    );
  });
});
