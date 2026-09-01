import { describe, expect, it } from "vitest";

import {
  getBillingGateRedirectTarget,
  hasActiveOrTrialingSubscription,
} from "./subscription-gate";

describe("hasActiveOrTrialingSubscription", () => {
  it("est vrai si une subscription est active", () => {
    expect(hasActiveOrTrialingSubscription([{ status: "active" }])).toBe(true);
  });

  it("est vrai si une subscription est trialing", () => {
    expect(hasActiveOrTrialingSubscription([{ status: "trialing" }])).toBe(true);
  });

  it("est faux si aucune subscription", () => {
    expect(hasActiveOrTrialingSubscription([])).toBe(false);
  });

  it("est faux si toutes annulées/expirées", () => {
    expect(
      hasActiveOrTrialingSubscription([{ status: "canceled" }, { status: "past_due" }]),
    ).toBe(false);
  });
});

describe("getBillingGateRedirectTarget", () => {
  it("ne redirige pas quand un abonnement actif/trialing existe", () => {
    expect(getBillingGateRedirectTarget("/dashboard/agenda", true)).toBeNull();
  });

  it("redirige vers /dashboard/settings sans abonnement", () => {
    expect(getBillingGateRedirectTarget("/dashboard/agenda", false)).toBe(
      "/dashboard/settings",
    );
  });

  it("n'entre pas en boucle sur /dashboard/settings lui-même", () => {
    expect(getBillingGateRedirectTarget("/dashboard/settings", false)).toBeNull();
  });

  it("exempte aussi les sous-chemins de /dashboard/settings", () => {
    expect(getBillingGateRedirectTarget("/dashboard/settings/team", false)).toBeNull();
  });
});
