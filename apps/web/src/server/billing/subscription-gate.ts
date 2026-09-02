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
