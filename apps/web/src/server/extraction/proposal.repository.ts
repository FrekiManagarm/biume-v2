import type { ReportSectionStates } from "@biume/contracts/report";
import { db } from "@biume/db";
import { reportProposal, reportSectionState } from "@biume/db/schema/index";
import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";

import { buildReportSectionStateRows } from "#/functions/report-domain";

export function createProposalRepository() {
  return {
    async listByReport(reportId: string) {
      return db
        .select()
        .from(reportProposal)
        .where(eq(reportProposal.reportId, reportId))
        .orderBy(asc(reportProposal.createdAt));
    },

    async replace(
      reportId: string,
      toDelete: string[],
      toInsert: Array<typeof reportProposal.$inferInsert>,
    ) {
      await db.transaction(async (tx) => {
        if (toDelete.length > 0) {
          // Suppression ciblée par identifiant, et seulement sur ce qui n'a pas
          // été décidé : un delete par rapport emporterait le travail du
          // praticien.
          await tx
            .delete(reportProposal)
            .where(
              and(
                eq(reportProposal.reportId, reportId),
                inArray(reportProposal.id, toDelete),
                isNull(reportProposal.decidedAt),
              ),
            );
        }

        if (toInsert.length > 0) {
          await tx.insert(reportProposal).values(toInsert);
        }
      });
    },

    async decide(
      reportId: string,
      proposalId: string,
      state: "confirmed" | "not_applicable",
    ): Promise<boolean> {
      const [updated] = await db
        .update(reportProposal)
        .set({ state, decidedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(reportProposal.reportId, reportId),
            eq(reportProposal.id, proposalId),
            // Une décision déjà prise ne se reprend pas par ce chemin.
            isNull(reportProposal.decidedAt),
          ),
        )
        .returning({ id: reportProposal.id });

      return updated !== undefined;
    },

    async decideSection(
      reportId: string,
      section: "clinical" | "anatomical" | "recommendations" | "notes",
      state: "confirmed" | "not_applicable",
    ): Promise<void> {
      await db
        .update(reportProposal)
        .set({ state, decidedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(reportProposal.reportId, reportId),
            eq(reportProposal.section, section),
            isNull(reportProposal.decidedAt),
          ),
        );
    },

    async syncSectionStates(reportId: string, states: ReportSectionStates) {
      const rows = buildReportSectionStateRows(reportId, states);

      await db
        .insert(reportSectionState)
        .values(rows)
        .onConflictDoUpdate({
          target: [reportSectionState.reportId, reportSectionState.section],
          set: { state: sql`excluded.state`, updatedAt: new Date() },
        });
    },
  };
}

export type ProposalRepository = ReturnType<typeof createProposalRepository>;
