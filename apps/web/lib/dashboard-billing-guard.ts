import "server-only";

import { redirect } from "next/navigation";

import { getOrganizationSubscriptionGateFn } from "#/lib/api/actions/subscription-gate.action";
import { resolveDashboardBillingRedirect } from "#/lib/dashboard-guards";
import { requireOrganizationId } from "#/server/auth/organization-scope";
import { shouldCheckBillingGate } from "#/server/billing/subscription-gate";

/**
 * Réévalue le paywall pour la page dashboard courante.
 *
 * Sous TanStack, `beforeLoad` repassait à chaque navigation : la garde de
 * facturation se réévaluait donc systématiquement. Un layout Next, lui, ne
 * se ré-exécute pas à la navigation cliente entre deux pages qu'il partage
 * — `app/dashboard/layout.tsx` garde son propre appel (première ligne de
 * défense au chargement document), mais un praticien sans abonnement qui
 * clique ensuite dans la sidebar ne repasserait plus jamais par cette garde
 * si rien d'autre ne la relance.
 *
 * Chaque page du dashboard doit donc appeler ce helper : une page Server
 * Component est, elle, ré-exécutée à chaque navigation. `requireOrganizationId`
 * est mémoïsé par `cache()` de React, donc un appel ici ne recrée pas de
 * lecture de session si une autre fonction de la page l'a déjà résolue dans
 * la même requête.
 *
 * L'authentification n'est pas de son ressort : `requireOrganizationId`
 * lève si la session ou l'organisation active manquent, comme dans toute
 * fonction de données du dashboard — c'est le filet déjà en place depuis le
 * lot B, pas quelque chose que ce helper doit dupliquer.
 */
export async function requireActiveBilling(pathname: string): Promise<void> {
  if (!shouldCheckBillingGate({ preload: false, pathname })) {
    return;
  }

  const organizationId = await requireOrganizationId();

  const gate = await getOrganizationSubscriptionGateFn({ organizationId });

  const billingRedirectTarget = resolveDashboardBillingRedirect(
    pathname,
    gate.hasActiveOrTrialingSubscription,
  );

  if (billingRedirectTarget) {
    redirect(`${billingRedirectTarget}?tab=billing&blocked=true`);
  }
}
