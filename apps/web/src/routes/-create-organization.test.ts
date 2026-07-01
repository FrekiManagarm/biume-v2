import { describe, expect, test } from "vitest";

import { createOrganizationSlug } from "./create-organization";

describe("createOrganizationSlug", () => {
  test("normalizes an organization name into a stable slug", () => {
    expect(createOrganizationSlug("Clinique Vétérinaire Les Alizés")).toBe(
      "clinique-veterinaire-les-alizes",
    );
  });

  test("removes surrounding separators and keeps a fallback", () => {
    expect(createOrganizationSlug("  --  ")).toBe("organisation");
  });
});
