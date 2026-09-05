import { createServerFn } from "@tanstack/react-start";
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

export const getOrganizationSubscriptionGateFn = createServerFn({
  method: "GET",
})
  .validator(getOrganizationSubscriptionGateSchema)
  .handler(async ({ data }) => {
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
        customerId: data.organizationId,
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
        `[Autumn] Impossible de vérifier l'abonnement de ${data.organizationId}`,
        error,
      );
      return { hasActiveOrTrialingSubscription: true };
    }
  });
