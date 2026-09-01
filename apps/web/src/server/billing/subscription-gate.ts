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

export function getBillingGateRedirectTarget(
  pathname: string,
  hasActiveOrTrialing: boolean,
): "/dashboard/settings" | null {
  if (hasActiveOrTrialing) {
    return null;
  }

  if (pathname === "/dashboard/settings" || pathname.startsWith("/dashboard/settings/")) {
    return null;
  }

  return "/dashboard/settings";
}
