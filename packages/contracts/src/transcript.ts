import { z } from "zod";

export const transcriptMaxCharacters = 20_000;

export const transcriptStatuses = [
  "pending",
  "running",
  "ready",
  "corrected",
  "inaudible",
  "failed",
] as const;
export const transcriptStatusSchema = z.enum(transcriptStatuses);
export type TranscriptStatus = z.infer<typeof transcriptStatusSchema>;

/**
 * `corrected` est terminal vis-à-vis de la machine : une fois que le praticien
 * a touché le texte, aucune relance automatique ne peut le remplacer. C'est la
 * traduction directe du principe « Biume prépare, le praticien décide ».
 *
 * `inaudible` est terminal aussi : réessayer sur le même audio ne produira pas
 * un autre résultat, et l'audio aura été purgé.
 */
const allowedTransitions = {
  pending: ["running", "failed"],
  running: ["ready", "inaudible", "failed"],
  ready: ["corrected"],
  corrected: [],
  inaudible: [],
  failed: ["running"],
} as const satisfies Record<TranscriptStatus, readonly TranscriptStatus[]>;

export function canTransitionTranscript(
  from: TranscriptStatus,
  to: TranscriptStatus,
): boolean {
  return allowedTransitions[from].some((allowed) => allowed === to);
}

const isoDateTimeSchema = z.iso.datetime();

export const transcriptSchema = z
  .object({
    captureId: z.uuid(),
    status: transcriptStatusSchema,
    text: z.string().max(transcriptMaxCharacters),
    language: z.string().min(2).max(8),
    provider: z.string().min(1),
    correctedAt: isoDateTimeSchema.nullable(),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
  })
  .strict();
export type Transcript = z.infer<typeof transcriptSchema>;

export const correctTranscriptRequestSchema = z
  .object({
    text: z.string().max(transcriptMaxCharacters),
  })
  .strict();
export type CorrectTranscriptRequest = z.infer<
  typeof correctTranscriptRequestSchema
>;
