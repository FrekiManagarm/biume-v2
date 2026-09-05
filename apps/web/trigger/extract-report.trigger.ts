import type { Proposal } from "@biume/contracts/proposal";
import type { ReportSectionStates } from "@biume/contracts/report";
import { task } from "@trigger.dev/sdk/v3";

import type { ExtractionCandidate } from "#/server/extraction/extraction.schema";
import {
  deriveSectionStates,
  mergePreservingDecisions,
  rejectUngroundedProposals,
} from "#/server/extraction/extraction.service";

export const extractReportTaskId = "report-extract";

export type ExtractionOutcome =
  | "extracted"
  | "nothing_to_extract"
  | "transcript_not_ready"
  | "failed";

export type ExtractionDeps = {
  loadTranscript(
    captureId: string,
  ): Promise<{ status: string; text: string } | null>;
  repository: {
    listByReport(reportId: string): Promise<Proposal[]>;
    replace(
      reportId: string,
      toDelete: string[],
      toInsert: Array<Record<string, unknown>>,
    ): Promise<void>;
    syncSectionStates(
      reportId: string,
      states: ReportSectionStates,
    ): Promise<void>;
  };
  extractor: {
    extract(transcript: string): Promise<{ proposals: ExtractionCandidate[] }>;
  };
  newId(): string;
  now(): Date;
};

/**
 * Les seuls états depuis lesquels extraire a un sens. Le parcours du produit
 * est séquentiel : la transcription est visible et corrigeable avant toute
 * interprétation structurée.
 */
const extractableStatuses = new Set(["ready", "corrected"]);

export async function runExtraction(
  deps: ExtractionDeps,
  input: { reportId: string; captureId: string },
): Promise<ExtractionOutcome> {
  const transcript = await deps.loadTranscript(input.captureId);
  if (!transcript) return "failed";

  if (transcript.status === "inaudible") return "nothing_to_extract";
  if (!extractableStatuses.has(transcript.status)) return "transcript_not_ready";
  if (transcript.text.trim().length === 0) return "nothing_to_extract";

  let produced: ExtractionCandidate[];
  try {
    const output = await deps.extractor.extract(transcript.text);
    produced = output.proposals;
  } catch {
    // Le message du fournisseur peut porter un identifiant de requête ou une
    // URL. Rien n'en est conservé.
    return "failed";
  }

  const { kept } = rejectUngroundedProposals(produced, transcript.text);

  const existing = await deps.repository.listByReport(input.reportId);
  const { toInsert, toDelete } = mergePreservingDecisions(existing, kept);

  const now = deps.now();
  await deps.repository.replace(
    input.reportId,
    toDelete,
    toInsert.map((candidate) => ({
      id: deps.newId(),
      reportId: input.reportId,
      captureId: input.captureId,
      section: candidate.section,
      kind: candidate.kind,
      text: candidate.text,
      state: "proposed" as const,
      anchorStart: candidate.anchor.start,
      anchorEnd: candidate.anchor.end,
      anchorQuote: candidate.anchor.quote,
      createdAt: now,
      updatedAt: now,
    })),
  );

  // Les états sont déduits de ce qui subsiste après écriture : les décisions
  // conservées, plus les propositions fraîches.
  const survivors = existing.filter(
    (proposal) => !toDelete.includes(proposal.id),
  );
  const inserted = toInsert.map(
    (candidate) =>
      ({
        id: "",
        reportId: input.reportId,
        section: candidate.section,
        kind: candidate.kind,
        text: candidate.text,
        state: "proposed",
        anchor: candidate.anchor,
        decidedAt: null,
      }) as Proposal,
  );

  await deps.repository.syncSectionStates(
    input.reportId,
    deriveSectionStates([...survivors, ...inserted]),
  );

  return "extracted";
}

export const extractReportTask = task({
  id: extractReportTaskId,
  run: async (payload: { reportId: string; captureId: string }) => {
    const { createProductionExtractionDeps } = await import(
      "#/server/extraction/extraction.deps"
    );

    return runExtraction(await createProductionExtractionDeps(), payload);
  },
});
