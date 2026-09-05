import { proposalKindSchema } from "@biume/contracts/proposal";
import { reportSectionIdSchema } from "@biume/contracts/report";
import { z } from "zod";

/**
 * La sortie du modèle est contrainte par ce schéma, pas espérée. Un modèle qui
 * ne peut produire que cette forme ne peut pas glisser un champ de confiance,
 * un diagnostic ou un commentaire libre dans le rapport.
 */
export const extractionCandidateSchema = z.object({
  section: reportSectionIdSchema,
  kind: proposalKindSchema,
  text: z.string().min(1).max(2000),
  anchor: z.object({
    start: z.number().int().nonnegative(),
    end: z.number().int().positive(),
    quote: z.string().min(1),
  }),
});
export type ExtractionCandidate = z.infer<typeof extractionCandidateSchema>;

export const extractionOutputSchema = z.object({
  proposals: z.array(extractionCandidateSchema).max(40),
});
export type ExtractionOutput = z.infer<typeof extractionOutputSchema>;
