import { task } from "@trigger.dev/sdk/v3";

import {
  buildTranscriptionPrompt,
  classifyTranscriptResult,
  transcriptionProviderId,
} from "#/server/transcription/transcription.service";

export const transcribeCaptureTaskId = "capture-transcribe";

export type TranscriptionOutcome =
  | "transcribed"
  | "inaudible"
  | "audio_purged"
  | "already_running"
  | "failed";

export type TranscriptionDeps = {
  repository: {
    ensure(captureId: string): Promise<void>;
    markRunning(captureId: string): Promise<boolean>;
    saveResult(
      captureId: string,
      result: { status: "ready" | "inaudible"; text: string; provider: string },
    ): Promise<void>;
    markFailed(captureId: string, code: string): Promise<void>;
  };
  loadContext(captureId: string): Promise<{
    objectKey: string;
    mimeType: string;
    patientName: string | null;
    species: string | null;
  } | null>;
  objectStore: { getBytes(key: string): Promise<Uint8Array | null> };
  transcriber: {
    transcribe(input: {
      bytes: Uint8Array;
      mimeType: string;
      prompt: string;
    }): Promise<{ text: string }>;
  };
};

/**
 * Orchestration pure : aucune dépendance à Trigger.dev, donc testable en
 * quelques millisecondes sans rien démarrer.
 */
export async function runTranscription(
  deps: TranscriptionDeps,
  captureId: string,
): Promise<TranscriptionOutcome> {
  await deps.repository.ensure(captureId);

  // La réclamation est atomique côté base : si elle échoue, une autre exécution
  // a déjà pris la ligne, ou le praticien a déjà corrigé le texte.
  if (!(await deps.repository.markRunning(captureId))) return "already_running";

  const context = await deps.loadContext(captureId);
  if (!context) {
    await deps.repository.markFailed(captureId, "capture_missing");
    return "failed";
  }

  const bytes = await deps.objectStore.getBytes(context.objectKey);
  if (bytes === null) {
    // La rétention de vingt-quatre heures a fait son travail. Ce n'est pas une
    // panne, et l'état doit rester compréhensible pour le praticien.
    await deps.repository.markFailed(captureId, "audio_purged");
    return "audio_purged";
  }

  try {
    const { text } = await deps.transcriber.transcribe({
      bytes,
      mimeType: context.mimeType,
      prompt: buildTranscriptionPrompt({
        patientName: context.patientName,
        species: context.species,
      }),
    });

    const classified = classifyTranscriptResult({ text });

    await deps.repository.saveResult(captureId, {
      status: classified.status === "ready" ? "ready" : "inaudible",
      text: classified.text,
      provider: transcriptionProviderId,
    });

    return classified.status === "ready" ? "transcribed" : "inaudible";
  } catch {
    // Le message du fournisseur peut porter une URL signée ou un identifiant de
    // requête. Seul un code normalisé est persisté.
    await deps.repository.markFailed(captureId, "provider_error");
    return "failed";
  }
}

export const transcribeCaptureTask = task({
  id: transcribeCaptureTaskId,
  run: async (payload: { captureId: string }) => {
    const { createProductionTranscriptionDeps } = await import(
      "#/server/transcription/transcription.deps"
    );

    return runTranscription(
      await createProductionTranscriptionDeps(),
      payload.captureId,
    );
  },
});
