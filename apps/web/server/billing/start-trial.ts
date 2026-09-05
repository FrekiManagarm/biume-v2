import { autumnPlanIds } from "#/lib/constants/autumn-ids";

export const TRIAL_DURATION_DAYS = 15;

export type StartOrganizationTrialInput = {
  organizationId: string;
  organizationName: string;
  ownerEmail: string;
  ownerUserId: string;
};

export type StartOrganizationTrialDeps = {
  upsertCustomer(input: {
    customerId: string;
    name: string;
    email: string;
    metadata: Record<string, string>;
  }): Promise<void>;
  attachPlan(input: { customerId: string; planId: string }): Promise<void>;
  triggerTrialEmails(input: {
    organizationId: string;
    organizationName: string;
    organizationEmail: string;
    trialStart: string;
    trialEnd: string;
  }): Promise<void>;
  now(): Date;
};

export async function startOrganizationTrial(
  deps: StartOrganizationTrialDeps,
  input: StartOrganizationTrialInput,
): Promise<{ trialStart: string; trialEnd: string }> {
  const trialStart = deps.now();
  const trialEnd = new Date(
    trialStart.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000,
  );

  await deps.upsertCustomer({
    customerId: input.organizationId,
    name: input.organizationName,
    email: input.ownerEmail,
    metadata: {
      organizationId: input.organizationId,
      ownerUserId: input.ownerUserId,
    },
  });

  // Doit réussir avant les emails : sans plan attaché, l'organisation reste
  // bloquée par le paywall même si les emails sont partis.
  await deps.attachPlan({
    customerId: input.organizationId,
    planId: autumnPlanIds.allInclusiveMonthly,
  });

  const trialStartIso = trialStart.toISOString();
  const trialEndIso = trialEnd.toISOString();

  try {
    await deps.triggerTrialEmails({
      organizationId: input.organizationId,
      organizationName: input.organizationName,
      organizationEmail: input.ownerEmail,
      trialStart: trialStartIso,
      trialEnd: trialEndIso,
    });
  } catch (error) {
    console.error(
      `[Autumn] Échec du déclenchement des emails d'essai pour ${input.organizationId}`,
      error,
    );
  }

  return { trialStart: trialStartIso, trialEnd: trialEndIso };
}
