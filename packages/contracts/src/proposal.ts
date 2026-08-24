import { z } from "zod";

import {
  reportSectionIdSchema,
  reportSectionStateSchema,
  type ReportSectionState,
} from "./report";

export const proposalKinds = [
  "consultationReason",
  "observation",
  "anatomicalIssue",
  "recommendation",
  "note",
] as const;
export const proposalKindSchema = z.enum(proposalKinds);
export type ProposalKind = z.infer<typeof proposalKindSchema>;

export const proposalTextMaxCharacters = 2000;

/**
 * L'ancre rattache une proposition au passage exact de transcription qui la
 * justifie. Elle porte à la fois des indices et la citation : les indices
 * servent à surligner, la citation sert à vérifier. C'est la citation qui fait
 * foi, parce qu'elle survit à un décalage d'indices.
 */
export const transcriptAnchorSchema = z
  .object({
    start: z.number().int().nonnegative(),
    end: z.number().int().positive(),
    quote: z.string().min(1).max(proposalTextMaxCharacters),
  })
  .strict()
  .refine((anchor) => anchor.end > anchor.start, {
    message: "La fin de l'ancre doit être postérieure à son début.",
  });
export type TranscriptAnchor = z.infer<typeof transcriptAnchorSchema>;

/**
 * Rejette toute proposition dont la citation ne se retrouve pas dans la
 * transcription. C'est le garde-fou qui empêche une invention du modèle
 * d'atteindre le praticien.
 */
export function anchorMatchesTranscript(
  anchor: { start: number; end: number; quote: string },
  transcript: string,
): boolean {
  if (anchor.end > transcript.length) return false;
  return transcript.includes(anchor.quote);
}

export const proposalSchema = z
  .object({
    id: z.string().min(1),
    reportId: z.string().min(1),
    section: reportSectionIdSchema,
    kind: proposalKindSchema,
    text: z.string().min(1).max(proposalTextMaxCharacters),
    state: reportSectionStateSchema,
    anchor: transcriptAnchorSchema,
    decidedAt: z.iso.datetime().nullable(),
  })
  .strict();
export type Proposal = z.infer<typeof proposalSchema>;

export const reportProposalsPageSize = 100;

export const reportProposalsResponseSchema = z
  .object({
    reportId: z.string().min(1),
    transcript: z.string(),
    items: z.array(proposalSchema).max(reportProposalsPageSize),
    sections: z.record(reportSectionIdSchema, reportSectionStateSchema),
  })
  .strict();
export type ReportProposalsResponse = z.infer<
  typeof reportProposalsResponseSchema
>;

/**
 * Un praticien confirme ou écarte. Il ne remet jamais une proposition « en
 * attente » : ce serait une régénération, qui est une action distincte.
 */
export const decideProposalRequestSchema = z
  .object({
    state: z.enum(["confirmed", "not_applicable"]),
  })
  .strict();
export type DecideProposalRequest = z.infer<typeof decideProposalRequestSchema>;

export const decideSectionRequestSchema = decideProposalRequestSchema;
export type DecideSectionRequest = z.infer<typeof decideSectionRequestSchema>;

/**
 * Ce que le praticien lit. Jamais l'état machine : « proposed » ne veut rien
 * dire pour un ostéopathe, « À vérifier » lui dit quoi faire.
 */
export const reportSectionLabels: Record<ReportSectionState, string> = {
  empty: "À remplir",
  proposed: "À vérifier",
  needs_confirmation: "À vérifier",
  confirmed: "Validé",
  not_applicable: "Sans objet",
};
