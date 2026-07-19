import {
  reportSectionIds,
  reportSectionStateValues,
} from "@biume/contracts/report";
import type {
  ReportSectionId,
  ReportSectionState,
} from "@biume/contracts/report";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { advancedReport } from "./advancedReport";

export const reportSection = pgEnum("report_section", reportSectionIds);

export const reportSectionDecision = pgEnum(
  "report_section_decision",
  reportSectionStateValues,
);

export const reportSectionState = pgTable(
  "report_section_state",
  {
    reportId: text("report_id")
      .notNull()
      .references(() => advancedReport.id, { onDelete: "cascade" }),
    section: reportSection("section").$type<ReportSectionId>().notNull(),
    state: reportSectionDecision("state").$type<ReportSectionState>().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.reportId, table.section] })],
);

export const reportSectionStateRelations = relations(
  reportSectionState,
  ({ one }) => ({
    report: one(advancedReport, {
      fields: [reportSectionState.reportId],
      references: [advancedReport.id],
    }),
  }),
);

export type PersistedReportSectionState =
  typeof reportSectionState.$inferSelect;
