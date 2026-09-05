import { describe, expect, it } from "vitest";

import {
  getDashboardRedirectTarget,
  resolveDashboardBillingRedirect,
} from "./dashboard-guards";

describe("getDashboardRedirectTarget", () => {
  it("redirige vers /signin sans session", () => {
    expect(getDashboardRedirectTarget(null)).toBe("/signin");
  });

  it("redirige vers /select-organization sans organisation active", () => {
    expect(
      getDashboardRedirectTarget({ session: { activeOrganizationId: null } }),
    ).toBe("/select-organization");
  });

  it("redirige vers /select-organization quand l'organisation courante diverge de l'active", () => {
    expect(
      getDashboardRedirectTarget(
        { session: { activeOrganizationId: "org-1" } },
        { id: "org-2" },
      ),
    ).toBe("/select-organization");
  });

  it("ne redirige pas quand l'organisation courante correspond à l'active", () => {
    expect(
      getDashboardRedirectTarget(
        { session: { activeOrganizationId: "org-1" } },
        { id: "org-1" },
      ),
    ).toBeNull();
  });
});

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

  it("exempte /dashboard/settings (anti-boucle : le layout ne connaît le chemin que via l'en-tête du proxy, sans cette exemption la redirection s'y répéterait indéfiniment)", () => {
    expect(
      resolveDashboardBillingRedirect("/dashboard/settings", false),
    ).toBeNull();
  });
});
