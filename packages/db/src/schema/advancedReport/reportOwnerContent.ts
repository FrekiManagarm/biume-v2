import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { advancedReport } from "./advancedReport";

export const reportOwnerContentSourceKind = pgEnum(
  "report_owner_content_source_kind",
  [
    "consultationReason",
    "observation",
    "anatomicalIssue",
    "recommendation",
    "notes",
  ],
);

export const reportOwnerContent = pgTable(
  "report_owner_content",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reportId: text("report_id")
      .notNull()
      .references(() => advancedReport.id, { onDelete: "cascade" }),
    sourceKind: reportOwnerContentSourceKind("source_kind").notNull(),
    sourceId: text("source_id").notNull(),
    ownerText: text("owner_text").notNull(),
    sourceFingerprint: text("source_fingerprint").notNull(),
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("report_owner_content_source_unique").on(
      table.reportId,
      table.sourceKind,
      table.sourceId,
    ),
  ],
);

export const reportOwnerContentRelations = relations(
  reportOwnerContent,
  ({ one }) => ({
    report: one(advancedReport, {
      fields: [reportOwnerContent.reportId],
      references: [advancedReport.id],
    }),
  }),
);

export type ReportOwnerContent = typeof reportOwnerContent.$inferSelect;
export type NewReportOwnerContent = typeof reportOwnerContent.$inferInsert;
