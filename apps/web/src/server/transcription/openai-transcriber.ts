import { env } from "@biume/env/server";

export const transcriptionProviderId = "openai:gpt-4o-transcribe";

export type Transcriber = {
  transcribe(input: {
    bytes: Uint8Array;
    mimeType: string;
    prompt: string;
  }): Promise<{ text: string }>;
};

/**
 * L'appel passe par l'API de transcription plutôt que par le SDK de génération
 * de texte : c'est un envoi de fichier multipart, pas une complétion.
 *
 * Aucune information du corps de réponse du fournisseur ne remonte à
 * l'appelant en cas d'échec — seulement le fait qu'il a échoué. Un message de
 * fournisseur peut porter un identifiant de requête ou une URL signée.
 */
export function createOpenAiTranscriber(): Transcriber {
  return {
    async transcribe({ bytes, mimeType, prompt }) {
      const form = new FormData();
      form.append(
        "file",
        new Blob([bytes as BlobPart], { type: mimeType }),
        "capture.m4a",
      );
      form.append("model", "gpt-4o-transcribe");
      form.append("language", "fr");
      form.append("prompt", prompt);
      form.append("response_format", "json");

      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { authorization: `Bearer ${env.OPENAI_API_KEY}` },
          body: form,
        },
      );

      if (!response.ok) {
        throw new Error(`transcription_failed:${response.status}`);
      }

      const payload = (await response.json()) as { text?: unknown };

      return { text: typeof payload.text === "string" ? payload.text : "" };
    },
  };
}
