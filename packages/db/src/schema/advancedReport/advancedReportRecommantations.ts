import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { advancedReport } from "./advancedReport"
import type { AdvancedReport } from "./advancedReport"
import { relations } from "drizzle-orm"
import type { InferSelectModel } from "drizzle-orm"

export const advancedReportRecommendations = pgTable("advanced_report_recommendations", {
  id: text("id").primaryKey(),
  advancedReportId: text("advanced_report_id").references(() => advancedReport.id, { onDelete: "cascade" }),
  recommendation: text("recommendation").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
})

export const advancedReportRecommendationsRelations = relations(advancedReportRecommendations, ({ one }) => ({
  advancedReport: one(advancedReport, {
    fields: [advancedReportRecommendations.advancedReportId],
    references: [advancedReport.id],
  }),
}))

export type AdvancedReportRecommendations = InferSelectModel<typeof advancedReportRecommendations> & {
  advancedReport: AdvancedReport
}
export type NewAdvancedReportRecommendations = typeof advancedReportRecommendations.$inferInsert
