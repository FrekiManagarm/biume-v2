import type { Proposal } from "@biume/contracts/proposal";
import { db } from "@biume/db";
import { captureTranscript } from "@biume/db/schema/index";
import { eq } from "drizzle-orm";

import type { ExtractionDeps } from "#/trigger/extract-report.trigger";
import { createOpenAiExtractor } from "./openai-extractor";
import { createProposalRepository } from "./proposal.repository";

/**
 * Les lignes persistées portent l'ancre à plat ; le domaine la manipule
 * structurée. La conversion vit ici, au bord, plutôt que dans les règles.
 */
function toProposal(row: {
  id: string;
  reportId: string;
  section: string;
  kind: string;
  text: string;
  state: string;
  anchorStart: number;
  anchorEnd: number;
  anchorQuote: string;
  decidedAt: Date | null;
}): Proposal {
  return {
    id: row.id,
    reportId: row.reportId,
    section: row.section as Proposal["section"],
    kind: row.kind as Proposal["kind"],
    text: row.text,
    state: row.state as Proposal["state"],
    anchor: {
      start: row.anchorStart,
      end: row.anchorEnd,
      quote: row.anchorQuote,
    },
    decidedAt: row.decidedAt?.toISOString() ?? null,
  };
}

export async function createProductionExtractionDeps(): Promise<ExtractionDeps> {
  const repository = createProposalRepository();

  return {
    extractor: createOpenAiExtractor(),
    newId: () => crypto.randomUUID(),
    now: () => new Date(),

    async loadTranscript(captureId) {
      const [row] = await db
        .select({
          status: captureTranscript.status,
          text: captureTranscript.text,
        })
        .from(captureTranscript)
        .where(eq(captureTranscript.captureId, captureId))
        .limit(1);

      return row ?? null;
    },

    repository: {
      async listByReport(reportId) {
        return (await repository.listByReport(reportId)).map(toProposal);
      },
      replace: repository.replace,
      syncSectionStates: repository.syncSectionStates,
    },
  };
}
