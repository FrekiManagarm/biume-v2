"use server";

import { z } from "zod";

import { getSession } from "#/functions/auth.function";
import { startOrganizationTrial } from "#/server/billing/start-trial";
import { createProductionStartTrialDeps } from "#/server/billing/start-trial.deps";

import { toActionResult } from "./action-result";

const startOrganizationTrialSchema = z.object({
  organizationId: z.string().min(1),
  organizationName: z.string().min(1),
});

export type StartOrganizationTrialInput = z.infer<
  typeof startOrganizationTrialSchema
>;

export const startOrganizationTrialFn = toActionResult(
  async (input: StartOrganizationTrialInput) => {
    const data = startOrganizationTrialSchema.parse(input);
    const session = await getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    if (data.organizationId !== session.session.activeOrganizationId) {
      throw new Error("Forbidden");
    }

    try {
      await startOrganizationTrial(createProductionStartTrialDeps(), {
        organizationId: data.organizationId,
        organizationName: data.organizationName,
        ownerEmail: session.user.email,
        ownerUserId: session.user.id,
      });
    } catch (error) {
      // Non bloquant : l'organisation existe déjà côté better-auth. Le
      // paywall (Task 6/7) rattrape au prochain accès dashboard.
      console.error(
        `[Autumn] Impossible de démarrer l'essai pour l'organisation ${data.organizationId}`,
        error,
      );
    }

    return { started: true };
  },
);
