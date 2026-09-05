import "server-only";

import { cache } from "react";

import { Autumn, AutumnError } from "autumn-js";
import { z } from "zod";

import { env } from "@biume/env/server";
import { getSession } from "#/functions/auth.function";
import {
  hasActiveOrTrialingSubscription,
  isBillingGateEnabled,
} from "#/server/billing/subscription-gate";

const getOrganizationSubscriptionGateSchema = z.object({
  organizationId: z.string().min(1),
});

export type GetOrganizationSubscriptionGateInput = z.infer<
  typeof getOrganizationSubscriptionGateSchema
>;

export async function getOrganizationSubscriptionGateFn(
  input: GetOrganizationSubscriptionGateInput,
) {
  const data = getOrganizationSubscriptionGateSchema.parse(input);

  return resolveOrganizationSubscriptionGate(data.organizationId);
}

/**
 * Une lecture Autumn par organisation et par requête, et une seule.
 *
 * `app/dashboard/layout.tsx` (via `getDashboardShellFn`) et
 * `requireActiveBilling` (`lib/dashboard-billing-guard.ts`, appelée par
 * chaque page du dashboard) vérifient toutes deux le paywall pour la même
 * organisation, dans la même requête, au premier chargement de document.
 * Sans mémoïsation, ça payait deux fois l'aller-retour réseau Autumn.
 *
 * `cache()` de React ne mémoïse que si l'argument est comparable par
 * valeur : un objet est comparé par référence (une `WeakMap`), donc envelopper
 * directement `getOrganizationSubscriptionGateFn({ organizationId })` n'aurait
 * rien mémoïsé — le layout et la page construisent chacun un littéral objet
 * différent. `organizationId`, en revanche, est une chaîne : `cache()` la
 * compare par valeur (une `Map`), donc les deux sites d'appel partagent bien
 * la même entrée.
 *
 * NE PAS retirer `cache()` en le croyant décoratif, et NE PAS revenir à un
 * argument objet en pensant simplifier : aucun test ne protège cette
 * mémoïsation (même raison qu'à `server/auth/organization-scope.ts:20-24` —
 * `cache()` ne mémoïse que dans un contexte de requête React, que Vitest ne
 * fournit pas). Elle a été vérifiée manuellement : un seul appel
 * `client.customers.get` par chargement de `/dashboard`, pas deux.
 */
const resolveOrganizationSubscriptionGate = cache(
  async (organizationId: string) => {
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    if (
      !isBillingGateEnabled({
        nodeEnv: env.NODE_ENV,
        forceInDev: env.BILLING_GATE_IN_DEV,
      })
    ) {
      return { hasActiveOrTrialingSubscription: true };
    }

    try {
      const client = new Autumn({ secretKey: env.AUTUMN_SECRET_KEY });
      const customer = await client.customers.get({
        customerId: organizationId,
      });

      return {
        hasActiveOrTrialingSubscription: hasActiveOrTrialingSubscription(
          customer.subscriptions,
        ),
      };
    } catch (error) {
      if (error instanceof AutumnError && error.statusCode === 404) {
        // Pas de customer Autumn pour cette organisation : elle n'a
        // effectivement aucun abonnement.
        return { hasActiveOrTrialingSubscription: false };
      }

      // Fail-open : une panne Autumn ne doit jamais bloquer tout le
      // dashboard.
      console.error(
        `[Autumn] Impossible de vérifier l'abonnement de ${organizationId}`,
        error,
      );
      return { hasActiveOrTrialingSubscription: true };
    }
  },
);
