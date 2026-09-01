import { describe, expect, it } from "vitest";

import { resolveDashboardBillingRedirect } from "./dashboard";

describe("resolveDashboardBillingRedirect", () => {
  it("ne redirige pas avec un abonnement actif", () => {
    expect(resolveDashboardBillingRedirect("/dashboard/agenda", true)).toBeNull();
  });

  it("redirige vers /dashboard/settings sans abonnement", () => {
    expect(resolveDashboardBillingRedirect("/dashboard/agenda", false)).toBe(
      "/dashboard/settings",
    );
  });

  it("exempte /dashboard/settings", () => {
    expect(resolveDashboardBillingRedirect("/dashboard/settings", false)).toBeNull();
  });
});
