import { createServerFn } from "@tanstack/react-start";
import { Autumn } from "autumn-js";
import { z } from "zod";

import { env } from "@biume/env/server";
import { hasActiveOrTrialingSubscription } from "#/server/billing/subscription-gate";

const getOrganizationSubscriptionGateSchema = z.object({
  organizationId: z.string().min(1),
});

export const getOrganizationSubscriptionGateFn = createServerFn({ method: "GET" })
  .validator(getOrganizationSubscriptionGateSchema)
  .handler(async ({ data }) => {
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
      // Fail-open : une panne Autumn ne doit jamais bloquer tout le
      // dashboard.
      console.error(
        `[Autumn] Impossible de vérifier l'abonnement de ${data.organizationId}`,
        error,
      );
      return { hasActiveOrTrialingSubscription: true };
    }
  });
