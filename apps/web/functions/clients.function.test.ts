import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { deleteClientSchema, updateClientSchema } from "./clients.schema";

describe("client mutation schemas", () => {
  test("accepts a valid client update with an empty optional email", () => {
    expect(
      updateClientSchema.safeParse({
        id: "client-1",
        name: "Marie",
        email: "",
      }).success,
    ).toBe(true);
  });

  test.each([
    { id: "", name: "Marie" },
    { id: "client-1", name: "" },
  ])("rejects an invalid client update: %o", (input) => {
    expect(updateClientSchema.safeParse(input).success).toBe(false);
  });

  test("accepts only non-empty client ids for deletion", () => {
    expect(deleteClientSchema.safeParse({ id: "client-1" }).success).toBe(true);
    expect(deleteClientSchema.safeParse({ id: "" }).success).toBe(false);
  });
});

describe("client mutation authorization", () => {
  test("scopes list, update, and delete operations to the organization", () => {
    const source = readFileSync(
      new URL("./clients.function.ts", import.meta.url),
      "utf8",
    );
    const organizationScopeCount = (
      source.match(/eq\(clients\.organizationId, organizationId\)/g) ?? []
    ).length;
    const deleteSource = source.slice(
      source.indexOf("export async function deleteClient"),
    );

    expect(organizationScopeCount).toBeGreaterThanOrEqual(3);
    expect(source).toContain("Client introuvable ou inaccessible.");
    expect(deleteSource).toContain(
      "eq(clients.organizationId, organizationId)",
    );
    expect(deleteSource).toContain("deleteClientWithPatientIsolation");
    expect(deleteSource).toContain("ne(pets.organizationId, organizationId)");
    expect(deleteSource).toContain("isNull(pets.organizationId)");
    expect(source).toContain("getClientRelationsForOrganization");
    expect(deleteSource).toContain("findScopedPatients");
    expect(deleteSource).toContain("appointments");
    expect(deleteSource).toContain("reports");
    expect(deleteSource).toContain("medicalDocuments");
    expect(deleteSource).toContain("appointmentId: true");
    expect(deleteSource).toContain("patientId: true");
  });
});
