import { describe, expect, it } from "vitest";

import { resolveDashboardBillingRedirect } from "./dashboard-guards";

describe("resolveDashboardBillingRedirect", () => {
  it("ne redirige pas avec un abonnement actif", () => {
    expect(
      resolveDashboardBillingRedirect("/dashboard/agenda", true),
    ).toBeNull();
  });

  it("redirige vers /dashboard/settings sans abonnement", () => {
    expect(resolveDashboardBillingRedirect("/dashboard/agenda", false)).toBe(
      "/dashboard/settings",
    );
  });

  it("exempte /dashboard/settings (anti-boucle : le layout ne connaît le chemin que via l'en-tête du middleware, sans cette exemption la redirection s'y répéterait indéfiniment)", () => {
    expect(
      resolveDashboardBillingRedirect("/dashboard/settings", false),
    ).toBeNull();
  });
});
