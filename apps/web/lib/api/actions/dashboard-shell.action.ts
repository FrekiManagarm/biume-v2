import { headers } from "next/headers";
import { z } from "zod";

import {
  getCurrentOrganization,
  getOrganizations,
  getSession,
} from "#/functions/auth.function";
import { getOrganizationSubscriptionGateFn } from "#/lib/api/actions/subscription-gate.action";
import { readSidebarDefaultOpen } from "#/lib/sidebar-cookie";
import { shouldCheckBillingGate } from "#/server/billing/subscription-gate";

const dashboardShellSchema = z.object({
  pathname: z.string().min(1),
  /**
   * Simple indice d'économie : un preload n'a pas besoin de l'état
   * d'abonnement, puisqu'il ne redirige jamais (voir `shouldCheckBillingGate`).
   * Le champ ne débloque aucun accès aux données — chaque fonction serveur
   * résout l'organisation depuis la session, indépendamment de ce drapeau.
   */
  preload: z.boolean().default(false),
});

export type GetDashboardShellInput = z.input<typeof dashboardShellSchema>;

/**
 * Tout ce dont le layout `/dashboard` a besoin, en un seul aller-retour.
 *
 * `beforeLoad` enchaînait cinq appels de fonctions serveur, dont quatre
 * sérialisés : session, organisation courante, paywall, puis liste des
 * organisations et état de la sidebar. Mesuré en local, ~480 ms passés en
 * allers-retours avant que la page ne commence à charger ses propres
 * données — et la chaîne repartait à chaque survol de lien de la sidebar,
 * `defaultPreload: "intent"` déclenchant un preload par lien survolé.
 *
 * Depuis le serveur, ces mêmes appels sont des invocations directes : plus
 * de HTTP entre eux, et ce qui est indépendant part en parallèle.
 */
export async function getDashboardShellFn(input: GetDashboardShellInput) {
  const data = dashboardShellSchema.parse(input);
  const session = await getSession();
  const activeOrganizationId = session?.session.activeOrganizationId ?? null;

  if (!session || !activeOrganizationId) {
    return {
      session,
      currentOrganizationId: null,
      organizations: [],
      sidebarDefaultOpen: true,
      hasActiveOrTrialingSubscription: true,
    };
  }

  const checkBilling =
    !data.preload &&
    shouldCheckBillingGate({ preload: false, pathname: data.pathname });

  const [currentOrganization, organizations, gate] = await Promise.all([
    // `getFullOrganization` échoue quand la session pointe une
    // organisation devenue inaccessible : `getDashboardRedirectTarget`
    // traite ce `null` comme une invitation à re-choisir un espace.
    getCurrentOrganization().catch(() => null),
    getOrganizations(),
    checkBilling
      ? getOrganizationSubscriptionGateFn({
          organizationId: activeOrganizationId,
        })
      : Promise.resolve({ hasActiveOrTrialingSubscription: true }),
  ]);

  return {
    session,
    // Seul l'identifiant est utilisé côté route (comparaison avec la
    // session) : inutile de sérialiser l'organisation complète, membres
    // et invitations compris.
    currentOrganizationId: currentOrganization?.id ?? null,
    organizations,
    sidebarDefaultOpen: readSidebarDefaultOpen((await headers()).get("cookie")),
    hasActiveOrTrialingSubscription: gate.hasActiveOrTrialingSubscription,
  };
}
