import { describe, expect, test } from "vitest";

import { getDashboardRedirectTarget } from "./dashboard";

describe("dashboard route guard", () => {
  test("redirects unauthenticated users to sign in", () => {
    expect(getDashboardRedirectTarget(null)).toBe("/signin");
  });

  test("redirects authenticated users without an active organization to organization selection", () => {
    expect(
      getDashboardRedirectTarget({
        session: { activeOrganizationId: null },
      }),
    ).toBe("/select-organization");
  });

  test("redirects authenticated users when the current organization cannot be resolved", () => {
    expect(
      getDashboardRedirectTarget(
        {
          session: { activeOrganizationId: "org_les-alizes" },
        },
        null,
      ),
    ).toBe("/select-organization");
  });

  test("allows authenticated users with a current organization", () => {
    expect(
      getDashboardRedirectTarget(
        {
          session: { activeOrganizationId: "org_les-alizes" },
        },
        { id: "org_les-alizes" },
      ),
    ).toBeNull();
  });
});
