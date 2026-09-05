import { describe, expect, it } from "vitest";

import {
  getBillingGateRedirectTarget,
  hasActiveOrTrialingSubscription,
  isBillingGateEnabled,
  shouldCheckBillingGate,
} from "./subscription-gate";

describe("hasActiveOrTrialingSubscription", () => {
  it("est vrai si une subscription est active", () => {
    expect(
      hasActiveOrTrialingSubscription([{ status: "active", pastDue: false }]),
    ).toBe(true);
  });

  it("est vrai si une subscription est trialing", () => {
    expect(
      hasActiveOrTrialingSubscription([{ status: "trialing", pastDue: false }]),
    ).toBe(true);
  });

  it("est faux si aucune subscription", () => {
    expect(hasActiveOrTrialingSubscription([])).toBe(false);
  });

  it("est faux si toutes annulées/expirées", () => {
    expect(
      hasActiveOrTrialingSubscription([
        { status: "canceled", pastDue: false },
        { status: "past_due", pastDue: false },
      ]),
    ).toBe(false);
  });

  it("est faux si une subscription active a un paiement en retard", () => {
    expect(
      hasActiveOrTrialingSubscription([{ status: "active", pastDue: true }]),
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
    expect(
      getBillingGateRedirectTarget("/dashboard/settings", false),
    ).toBeNull();
  });

  it("exempte aussi les sous-chemins de /dashboard/settings", () => {
    expect(
      getBillingGateRedirectTarget("/dashboard/settings/team", false),
    ).toBeNull();
  });

  it("ne confond pas un chemin similaire avec un sous-chemin de /dashboard/settings", () => {
    expect(
      getBillingGateRedirectTarget("/dashboard/settings-other", false),
    ).toBe("/dashboard/settings");
  });
});

describe("shouldCheckBillingGate", () => {
  it("vérifie l'abonnement lors d'une vraie navigation vers une page protégée", () => {
    expect(
      shouldCheckBillingGate({ preload: false, pathname: "/dashboard/agenda" }),
    ).toBe(true);
  });

  it("ne vérifie jamais l'abonnement pendant un preload", () => {
    // Régression : `defaultPreload: "intent"` déclenche un preload au survol
    // d'un lien de la sidebar. Le preload exécutait `beforeLoad`, qui lançait
    // le `redirect` du paywall ; `Router.preloadRoute` suit ce redirect en
    // preloadant sa cible — c'est-à-dire la page de facturation déjà
    // affichée. Les matches actifs étaient rechargés, la sidebar re-rendue
    // sous le curseur toujours immobile, ce qui relançait le preload : boucle
    // infinie, écran de chargement puis page blanche jusqu'au rechargement.
    // Un preload est spéculatif : il ne doit ni appeler Autumn ni rediriger.
    expect(
      shouldCheckBillingGate({ preload: true, pathname: "/dashboard/agenda" }),
    ).toBe(false);
  });

  it("ne consulte pas Autumn sur la page de facturation elle-même", () => {
    // `getBillingGateRedirectTarget` n'y redirige jamais : l'appel réseau
    // n'aurait servi à rien.
    expect(
      shouldCheckBillingGate({
        preload: false,
        pathname: "/dashboard/settings",
      }),
    ).toBe(false);
    expect(
      shouldCheckBillingGate({
        preload: false,
        pathname: "/dashboard/settings/team",
      }),
    ).toBe(false);
  });

  it("ne confond pas un chemin similaire avec la page de facturation", () => {
    expect(
      shouldCheckBillingGate({
        preload: false,
        pathname: "/dashboard/settings-other",
      }),
    ).toBe(true);
  });
});

describe("isBillingGateEnabled", () => {
  it("laisse passer le développement local", () => {
    // Sans abonnement sur la base de dev, le paywall renvoyait sur la
    // facturation à chaque navigation : impossible de travailler sur le
    // reste du dashboard.
    expect(isBillingGateEnabled({ nodeEnv: "development" })).toBe(false);
  });

  it("reste actif en production", () => {
    expect(isBillingGateEnabled({ nodeEnv: "production" })).toBe(true);
  });

  it("reste actif dans tout environnement non identifié comme dev", () => {
    // Staging, preview, test : le défaut sûr est d'appliquer le paywall.
    expect(isBillingGateEnabled({ nodeEnv: "staging" })).toBe(true);
    expect(isBillingGateEnabled({ nodeEnv: "test" })).toBe(true);
  });

  it("se rallume en dev quand on veut tester le paywall", () => {
    expect(
      isBillingGateEnabled({ nodeEnv: "development", forceInDev: "true" }),
    ).toBe(true);
  });

  it("ne se rallume que sur la valeur exacte attendue", () => {
    expect(
      isBillingGateEnabled({ nodeEnv: "development", forceInDev: "" }),
    ).toBe(false);
    expect(
      isBillingGateEnabled({ nodeEnv: "development", forceInDev: "false" }),
    ).toBe(false);
  });
});
