import { db } from "@biume/db";
import { audioCapture, pets } from "@biume/db/schema/index";
import { eq } from "drizzle-orm";

import { getR2AudioObjectStore } from "#/server/mobile/r2-audio-object-store.factory";
import type { TranscriptionDeps } from "#/trigger/transcribe-capture.trigger";
import { createOpenAiTranscriber } from "./openai-transcriber";
import { createTranscriptRepository } from "./transcript.repository";

export async function createProductionTranscriptionDeps(): Promise<TranscriptionDeps> {
  const repository = createTranscriptRepository();
  const objectStore = getR2AudioObjectStore();
  const transcriber = createOpenAiTranscriber();

  return {
    repository,
    objectStore,
    transcriber,

    /**
     * Le nom de l'animal et son espèce servent uniquement à amorcer le modèle.
     * Ils ne sont jamais persistés dans la transcription : celle-ci ne porte
     * que ce que le praticien a dit.
     */
    async loadContext(captureId) {
      const [row] = await db
        .select({
          objectKey: audioCapture.objectKey,
          mimeType: audioCapture.mimeType,
          patientName: pets.name,
          breed: pets.breed,
        })
        .from(audioCapture)
        .leftJoin(pets, eq(pets.id, audioCapture.patientId))
        .where(eq(audioCapture.id, captureId))
        .limit(1);

      if (!row) return null;

      return {
        objectKey: row.objectKey,
        mimeType: row.mimeType,
        patientName: row.patientName ?? null,
        breed: row.breed ?? null,
      };
    },
  };
}
