import { pgEnum, pgTable, text, integer, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { relations } from "drizzle-orm"
import type { InferSelectModel } from "drizzle-orm"
import { anatomicalPart } from "../anatomicalPart"
import type { AnatomicalPart } from "../anatomicalPart"
import type { AnatomicalPartType } from "../anatomicalPartType"
import { advancedReport } from "./advancedReport"
import type { AdvancedReport } from "./advancedReport"
import {
  lateralityValues,
  observationTypeValues,
  persistedAnatomicalIssueTypes,
} from "@biume/contracts/report"

// Définition des enums pour les types
export const anatomicalIssueType = pgEnum(
  "anatomical_issue_type",
  persistedAnatomicalIssueTypes,
)
export const lateralityType = pgEnum("laterality_type", lateralityValues)
export const anatomicalIssueObservationType = pgEnum(
  "anatomical_issue_observation_type",
  observationTypeValues,
)

export const anatomicalIssue = pgTable("anatomical_issue", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  type: anatomicalIssueType("type").notNull().default("dysfunction"),
  observationType: anatomicalIssueObservationType("observation_type").default("none"),
  anatomicalPartId: text("anatomical_part_id")
    .notNull()
    .references(() => anatomicalPart.id, { onDelete: "cascade" }),
  advancedReportId: text("advanced_report_id")
    .notNull()
    .references(() => advancedReport.id, { onDelete: "cascade" }),
  notes: text("notes").default(""),
  laterality: lateralityType("laterality").notNull().default("bilateral"),
  severity: integer("severity").notNull().default(2),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
})

export const anatomicalIssueRelations = relations(anatomicalIssue, ({ one }) => ({
  anatomicalPart: one(anatomicalPart, {
    fields: [anatomicalIssue.anatomicalPartId],
    references: [anatomicalPart.id],
  }),
  advancedReport: one(advancedReport, {
    fields: [anatomicalIssue.advancedReportId],
    references: [advancedReport.id],
  }),
}))
// Types pour Typescript
export type AnatomicalIssue = InferSelectModel<typeof anatomicalIssue> & {
  anatomicalPart: AnatomicalPart
  anatomicalPartType: AnatomicalPartType
  advancedReport: AdvancedReport
}
export type NewAnatomicalIssue = typeof anatomicalIssue.$inferInsert

// Schemas pour validation avec Zod
export const AnatomicalIssueSchema = createSelectSchema(anatomicalIssue)
export const CreateAnatomicalIssueSchema = createInsertSchema(anatomicalIssue)
