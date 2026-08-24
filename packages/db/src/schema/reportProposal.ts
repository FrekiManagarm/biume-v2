import { proposalKinds } from "@biume/contracts/proposal";
import {
  reportSectionIds,
  reportSectionStateValues,
} from "@biume/contracts/report";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { advancedReport } from "./advancedReport/advancedReport";
import { audioCapture } from "./audioCapture";

export const reportProposalKind = pgEnum("report_proposal_kind", proposalKinds);
export const reportProposalSection = pgEnum(
  "report_proposal_section",
  reportSectionIds,
);
export const reportProposalState = pgEnum(
  "report_proposal_state",
  reportSectionStateValues,
);

/**
 * Une proposition d'extraction, rattachée au rapport qu'elle alimente et à la
 * dictée dont elle est issue.
 *
 * `anchorQuote` n'est pas une commodité d'affichage : c'est la preuve. Les
 * indices permettent de surligner, mais c'est la citation qui permet de
 * vérifier qu'une proposition n'a pas été inventée, et elle survit à une
 * correction de transcription qui décale les indices.
 */
export const reportProposal = pgTable(
  "report_proposal",
  {
    id: text("id").primaryKey(),
    reportId: text("report_id")
      .notNull()
      .references(() => advancedReport.id, { onDelete: "cascade" }),
    captureId: uuid("capture_id").references(() => audioCapture.id, {
      onDelete: "set null",
    }),
    section: reportProposalSection("section").notNull(),
    kind: reportProposalKind("kind").notNull(),
    text: text("text").notNull(),
    state: reportProposalState("state").notNull().default("proposed"),
    anchorStart: integer("anchor_start").notNull(),
    anchorEnd: integer("anchor_end").notNull(),
    anchorQuote: text("anchor_quote").notNull(),
    /** Numéro de passe d'extraction, pour ne régénérer que ce qui n'a pas été décidé. */
    generation: integer("generation").notNull().default(1),
    decidedAt: timestamp("decided_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("report_proposal_report_idx").on(table.reportId),
    index("report_proposal_state_idx").on(table.reportId, table.state),
  ],
);

export const reportProposalRelations = relations(reportProposal, ({ one }) => ({
  report: one(advancedReport, {
    fields: [reportProposal.reportId],
    references: [advancedReport.id],
  }),
  capture: one(audioCapture, {
    fields: [reportProposal.captureId],
    references: [audioCapture.id],
  }),
}));

export type PersistedProposal = typeof reportProposal.$inferSelect;
