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
      source.match(/eq\(clients\.organizationId, organization\.id\)/g) ?? []
    ).length;

    expect(organizationScopeCount).toBeGreaterThanOrEqual(3);
    expect(source).toContain("Client introuvable ou inaccessible.");
  });
});
