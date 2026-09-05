import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getOrganizationSubscriptionGateFn } from "#/lib/api/actions/subscription-gate.action";
import { resolveDashboardBillingRedirect } from "#/lib/dashboard-guards";
import { PATHNAME_HEADER } from "#/lib/pathname-header";
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
 *
 * Le chemin n'est pas un paramètre : il est lu depuis `PATHNAME_HEADER`, que
 * le proxy (`proxy.ts`, matcher `/dashboard/:path*`) pose sur toute requête
 * dashboard — exactement comme `app/dashboard/layout.tsx` le fait. Un
 * littéral fourni par l'appelant serait sans risque partout... sauf recopié
 * tel quel sur `/dashboard/settings`, où il ferait boucler la garde sur
 * elle-même : exactement ce que ce mécanisme existe pour empêcher.
 */
export async function requireActiveBilling(): Promise<void> {
  const pathnameHeader = (await headers()).get(PATHNAME_HEADER);

  if (!pathnameHeader) {
    // Le proxy pose toujours cet en-tête sur une requête `/dashboard/:path*`
    // réelle : son absence ici signale une panne (proxy non exécuté, ou
    // en-tête filtré en amont), pas un cas nominal à dégrader silencieusement
    // — voir le même choix dans `app/dashboard/layout.tsx`.
    throw new Error(
      "En-tête pathname absent : le proxy dashboard ne s'est pas exécuté pour cette requête.",
    );
  }

  const pathname = pathnameHeader;

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
