import {
  transcriptMaxCharacters,
  type TranscriptStatus,
} from "@biume/contracts/transcript";

import { osteopathyLexicon } from "./lexicon";

export const transcriptionMaxAttempts = 3;

/**
 * Déclaré ici plutôt que dans l'adaptateur : celui-ci importe `env`, dont la
 * validation se déclenche au chargement du module. L'orchestration doit rester
 * chargeable — et donc testable — sans aucune variable d'environnement.
 */
export const transcriptionProviderId = "openai:gpt-4o-transcribe";

/** Borne du paramètre d'amorçage côté fournisseur. */
const promptMaxCharacters = 1000;

/**
 * Artefacts que les modèles de transcription produisent sur du silence ou du
 * bruit de fond. Les laisser passer ferait croire au praticien qu'une séance a
 * été captée alors qu'il n'y avait rien à capter.
 */
const silenceArtifacts = [
  "sous-titres réalisés par la communauté d'amara.org",
  "sous-titrage société radio-canada",
  "merci d'avoir regardé cette vidéo !",
  "merci d'avoir regardé cette vidéo",
  "merci",
  "...",
];

export function buildTranscriptionPrompt(context: {
  patientName: string | null;
  species: string | null;
}): string {
  const subject = context.patientName
    ? `L'animal ausculté s'appelle ${context.patientName}.`
    : "";

  const prompt = [
    "Dictée d'un ostéopathe animalier après une séance, en français.",
    subject,
    `Vocabulaire attendu : ${osteopathyLexicon.join(", ")}.`,
  ]
    .filter((part) => part.length > 0)
    .join(" ");

  return prompt.slice(0, promptMaxCharacters);
}

export function truncateTranscript(text: string): string {
  return text.slice(0, transcriptMaxCharacters);
}

export function classifyTranscriptResult(input: { text: string }): {
  status: TranscriptStatus;
  text: string;
} {
  const trimmed = input.text.trim();
  const normalized = trimmed.toLowerCase().replace(/\s+/g, " ");

  if (trimmed.length === 0 || silenceArtifacts.includes(normalized)) {
    return { status: "inaudible", text: "" };
  }

  return { status: "ready", text: truncateTranscript(trimmed) };
}
