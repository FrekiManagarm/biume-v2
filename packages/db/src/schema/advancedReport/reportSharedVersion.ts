import type { OwnerReportSnapshot } from "@biume/contracts/report";
import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "../organization";
import { advancedReport } from "./advancedReport";

export const reportSharedVersion = pgTable(
  "report_shared_version",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reportId: text("report_id")
      .notNull()
      .references(() => advancedReport.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    reportRevision: integer("report_revision").notNull(),
    snapshot: jsonb("snapshot").$type<OwnerReportSnapshot>().notNull(),
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("report_shared_version_revision_unique").on(
      table.reportId,
      table.reportRevision,
    ),
  ],
);

export const reportSharedVersionRelations = relations(
  reportSharedVersion,
  ({ one }) => ({
    report: one(advancedReport, {
      fields: [reportSharedVersion.reportId],
      references: [advancedReport.id],
    }),
    organization: one(organization, {
      fields: [reportSharedVersion.organizationId],
      references: [organization.id],
    }),
  }),
);

export type ReportSharedVersion = typeof reportSharedVersion.$inferSelect;
