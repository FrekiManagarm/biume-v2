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
      source.match(/eq\(pets\.organizationId, organization\.id\)/g) ?? []
    ).length;

    expect(organizationScopeCount).toBeGreaterThanOrEqual(3);
    expect(source).toContain("eq(clients.organizationId, organization.id)");
    expect(source).toContain("Propriétaire introuvable ou inaccessible.");
    expect(source).toContain("Patient introuvable ou inaccessible.");
  });
});
