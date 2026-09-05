import { canTransitionTranscript } from "@biume/contracts/transcript";
import { db } from "@biume/db";
import { captureTranscript } from "@biume/db/schema/index";
import { and, eq, inArray } from "drizzle-orm";

export function createTranscriptRepository() {
  return {
    /** Crée la ligne en `pending` si elle n'existe pas. Idempotent. */
    async ensure(captureId: string): Promise<void> {
      await db
        .insert(captureTranscript)
        .values({ captureId })
        .onConflictDoNothing();
    },

    async markRunning(captureId: string): Promise<boolean> {
      const [updated] = await db
        .update(captureTranscript)
        .set({ status: "running", updatedAt: new Date() })
        .where(
          and(
            eq(captureTranscript.captureId, captureId),
            // La transition est portée par la clause `where` : deux exécutions
            // concurrentes ne peuvent pas toutes les deux réclamer la ligne, et
            // une correction humaine ne peut jamais être reprise.
            inArray(captureTranscript.status, ["pending", "failed"]),
          ),
        )
        .returning({ captureId: captureTranscript.captureId });

      return updated !== undefined;
    },

    async saveResult(
      captureId: string,
      result: { status: "ready" | "inaudible"; text: string; provider: string },
    ): Promise<void> {
      await db
        .update(captureTranscript)
        .set({
          status: result.status,
          text: result.text,
          provider: result.provider,
          lastErrorCode: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(captureTranscript.captureId, captureId),
            eq(captureTranscript.status, "running"),
          ),
        );
    },

    async markFailed(captureId: string, code: string): Promise<void> {
      await db
        .update(captureTranscript)
        .set({ status: "failed", lastErrorCode: code, updatedAt: new Date() })
        .where(
          and(
            eq(captureTranscript.captureId, captureId),
            eq(captureTranscript.status, "running"),
          ),
        );
    },

    async correct(captureId: string, text: string): Promise<boolean> {
      const [current] = await db
        .select({ status: captureTranscript.status })
        .from(captureTranscript)
        .where(eq(captureTranscript.captureId, captureId))
        .limit(1);

      if (!current) return false;
      // Recorriger une transcription déjà corrigée reste permis : c'est le
      // praticien qui revient sur son propre texte, pas une relance automatique.
      if (
        current.status !== "corrected" &&
        !canTransitionTranscript(current.status, "corrected")
      ) {
        return false;
      }

      const now = new Date();
      await db
        .update(captureTranscript)
        .set({ status: "corrected", text, correctedAt: now, updatedAt: now })
        .where(eq(captureTranscript.captureId, captureId));

      return true;
    },
  };
}

export type TranscriptRepository = ReturnType<
  typeof createTranscriptRepository
>;
