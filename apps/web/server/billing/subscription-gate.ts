export type SubscriptionForGate = { status: string; pastDue: boolean };

export function hasActiveOrTrialingSubscription(
  subscriptions: SubscriptionForGate[],
): boolean {
  return subscriptions.some(
    (subscription) =>
      ["active", "trialing"].includes(subscription.status) &&
      !subscription.pastDue,
  );
}

/**
 * Le paywall doit-il s'appliquer dans cet environnement ?
 *
 * Les organisations de la base de développement n'ont pas d'abonnement : le
 * gate y renvoyait sur la facturation à chaque navigation, rendant le reste
 * du dashboard inaccessible. On le neutralise donc en développement, et
 * seulement là — tout autre environnement (production, staging, preview,
 * test) garde le paywall par défaut.
 *
 * `BILLING_GATE_IN_DEV=true` le rallume pour travailler sur le paywall
 * lui-même. Volontairement à sens unique : aucune variable ne permet de
 * l'éteindre hors développement.
 */
export function isBillingGateEnabled({
  nodeEnv,
  forceInDev,
}: {
  nodeEnv: string;
  forceInDev?: string;
}): boolean {
  if (nodeEnv !== "development") {
    return true;
  }

  return forceInDev === "true";
}

function isBillingSettingsPath(pathname: string): boolean {
  return (
    pathname === "/dashboard/settings" ||
    pathname.startsWith("/dashboard/settings/")
  );
}

/**
 * Faut-il interroger Autumn pour cette entrée dans `beforeLoad` ?
 *
 * Un preload est spéculatif — TanStack Router en déclenche un au survol de
 * chaque lien (`defaultPreload: "intent"`). Y exécuter le paywall provoquait
 * une boucle infinie : le `redirect` levé pendant le preload était suivi par
 * `Router.preloadRoute`, qui preloadait alors la page de facturation déjà
 * affichée ; ses matches actifs étaient rechargés, la sidebar re-rendue sous
 * un curseur immobile, et le survol relançait le preload. L'écran restait
 * bloqué sur le composant de chargement puis devenait blanc.
 *
 * La vraie navigation, elle, repasse par `beforeLoad` avec `preload: false` :
 * le paywall garde tout son effet.
 */
export function shouldCheckBillingGate({
  preload,
  pathname,
}: {
  preload: boolean;
  pathname: string;
}): boolean {
  if (preload) {
    return false;
  }

  // Sur la page de facturation, `getBillingGateRedirectTarget` renvoie
  // toujours `null` : l'appel réseau serait perdu.
  return !isBillingSettingsPath(pathname);
}

export function getBillingGateRedirectTarget(
  pathname: string,
  hasActiveOrTrialing: boolean,
): "/dashboard/settings" | null {
  if (hasActiveOrTrialing) {
    return null;
  }

  if (isBillingSettingsPath(pathname)) {
    return null;
  }

  return "/dashboard/settings";
}
