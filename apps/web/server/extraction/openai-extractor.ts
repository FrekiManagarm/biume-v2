import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

import {
  extractionOutputSchema,
  type ExtractionOutput,
} from "./extraction.schema";
import { buildExtractionPrompt } from "./extraction.service";

export type Extractor = {
  extract(transcript: string): Promise<ExtractionOutput>;
};

/**
 * `generateObject` contraint la sortie au schéma plutôt que d'espérer un JSON
 * bien formé. Une sortie non conforme échoue ici, jamais plus loin.
 *
 * La température est nulle : sur de l'extraction, la créativité est exactement
 * le défaut à éliminer.
 */
export function createOpenAiExtractor(): Extractor {
  return {
    async extract(transcript) {
      const { object } = await generateObject({
        model: openai("gpt-4o"),
        schema: extractionOutputSchema,
        temperature: 0,
        prompt: buildExtractionPrompt(transcript),
      });

      return object;
    },
  };
}
