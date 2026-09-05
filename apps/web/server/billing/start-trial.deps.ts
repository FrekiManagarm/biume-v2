import { Autumn } from "autumn-js";

import { env } from "@biume/env/server";
import { trialWorkflow } from "#/trigger/trial.trigger";
import type { StartOrganizationTrialDeps } from "./start-trial";

export function createProductionStartTrialDeps(): StartOrganizationTrialDeps {
  const client = new Autumn({ secretKey: env.AUTUMN_SECRET_KEY });

  return {
    now: () => new Date(),
    async upsertCustomer({ customerId, name, email, metadata }) {
      await client.customers.getOrCreate({ customerId, name, email, metadata });
    },
    async attachPlan({ customerId, planId }) {
      await client.billing.attach({ customerId, planId });
    },
    async triggerTrialEmails(input) {
      await trialWorkflow.trigger(input);
    },
  };
}
