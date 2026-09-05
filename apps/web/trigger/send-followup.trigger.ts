import { schedules } from "@trigger.dev/sdk/v3";

export const sendFollowUpTaskId = "followup-send";

/** Borne une exécution pour qu'un arriéré ne dépasse pas son budget de temps. */
export const followUpBatchSize = 50;

export type DueFollowUp = {
  id: string;
  shareToken: string | null;
  ownerEmail: string | null;
};

export type FollowUpBatchDeps = {
  claimDue(limit: number): Promise<DueFollowUp[]>;
  sendEmail(input: { followUpId: string; email: string; shareToken: string }): Promise<void>;
  markSent(followUpId: string, at: Date): Promise<void>;
  markFailed(followUpId: string, code: string): Promise<void>;
  now(): Date;
};

/**
 * Orchestration pure : aucune dépendance à Trigger.dev.
 *
 * L'échec d'un envoi est isolé — un propriétaire dont la boîte refuse le
 * message ne doit pas empêcher les autres de recevoir le leur.
 */
export async function runFollowUpBatch(
  deps: FollowUpBatchDeps,
): Promise<{ sent: number; failed: number }> {
  const due = await deps.claimDue(followUpBatchSize);

  let sent = 0;
  let failed = 0;

  for (const followUp of due) {
    if (!followUp.ownerEmail || !followUp.shareToken) {
      await deps.markFailed(followUp.id, "no_owner_email");
      failed += 1;
      continue;
    }

    try {
      await deps.sendEmail({
        followUpId: followUp.id,
        email: followUp.ownerEmail,
        shareToken: followUp.shareToken,
      });
      await deps.markSent(followUp.id, deps.now());
      sent += 1;
    } catch {
      // Le message du fournisseur porte l'adresse du destinataire et son code
      // de refus. Seul un code normalisé est persisté.
      await deps.markFailed(followUp.id, "send_failed");
      failed += 1;
    }
  }

  return { sent, failed };
}

export const sendFollowUpTask = schedules.task({
  id: sendFollowUpTaskId,
  cron: "0 * * * *",
  run: async () => {
    const { createProductionFollowUpBatchDeps } = await import(
      "#/server/followup/followup.deps"
    );

    return runFollowUpBatch(await createProductionFollowUpBatchDeps());
  },
});
