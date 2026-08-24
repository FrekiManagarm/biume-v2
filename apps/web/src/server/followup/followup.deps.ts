import { db } from "@biume/db";
import { clients, followUp, pets, reportShareLink } from "@biume/db/schema/index";
import { and, eq, inArray, lte, sql } from "drizzle-orm";

import type { FollowUpBatchDeps } from "#/trigger/send-followup.trigger";

export async function createProductionFollowUpBatchDeps(): Promise<FollowUpBatchDeps> {
  return {
    now: () => new Date(),

    /**
     * Réclamation atomique : la mise à jour conditionnelle et le `RETURNING`
     * font qu'aucune ligne ne peut être prise deux fois, même si deux
     * exécutions se chevauchent.
     */
    async claimDue(limit) {
      const claimed = await db
        .update(followUp)
        .set({ status: "sent", updatedAt: new Date() })
        .where(
          and(
            eq(followUp.status, "scheduled"),
            lte(followUp.dueAt, new Date()),
            sql`${followUp.id} IN (
              SELECT id FROM follow_up
              WHERE status = 'scheduled' AND due_at <= now()
              ORDER BY due_at
              LIMIT ${limit}
            )`,
          ),
        )
        .returning({ id: followUp.id, shareToken: followUp.shareToken });

      if (claimed.length === 0) return [];

      const rows = await db
        .select({
          id: followUp.id,
          shareToken: followUp.shareToken,
          ownerEmail: clients.email,
        })
        .from(followUp)
        .leftJoin(reportShareLink, eq(reportShareLink.token, followUp.shareToken))
        .leftJoin(clients, eq(clients.id, reportShareLink.ownerId))
        .where(
          inArray(
            followUp.id,
            claimed.map((row) => row.id),
          ),
        );

      return rows;
    },

    async sendEmail({ email, shareToken }) {
      const { Resend } = await import("resend");
      const { env } = await import("@biume/env/server");
      const { FollowUpQuestionnaireEmail } = await import(
        "@biume/emails/FollowUpQuestionnaireEmail"
      );

      const [patient] = await db
        .select({ name: pets.name })
        .from(reportShareLink)
        .innerJoin(clients, eq(clients.id, reportShareLink.ownerId))
        .innerJoin(pets, eq(pets.ownerId, clients.id))
        .where(eq(reportShareLink.token, shareToken))
        .limit(1);

      await new Resend(env.RESEND_API_KEY).emails.send({
        from: "Biume <no-reply@biume.app>",
        to: email,
        subject: "Comment va votre animal depuis la séance ?",
        react: FollowUpQuestionnaireEmail({
          patientName: patient?.name ?? "votre animal",
          url: `${env.APP_URL}/r/${shareToken}`,
        }),
      });
    },

    async markSent(followUpId, at) {
      await db
        .update(followUp)
        .set({ sentAt: at, updatedAt: at })
        .where(eq(followUp.id, followUpId));
    },

    /**
     * Un refus transitoire retombe en `scheduled` et la prochaine exécution
     * réessaiera. Une absence d'adresse, elle, ne se résoudra jamais toute
     * seule : la remettre en file produirait une reprise horaire éternelle qui
     * n'enverrait rien. Le suivi est annulé et le motif conservé, pour que le
     * praticien puisse compléter la fiche puis reprogrammer.
     */
    async markFailed(followUpId, code) {
      const now = new Date();
      const permanent = code === "no_owner_email";

      await db
        .update(followUp)
        .set({
          status: permanent ? "cancelled" : "scheduled",
          lastErrorCode: code,
          updatedAt: now,
        })
        .where(eq(followUp.id, followUpId));
    },
  };
}
