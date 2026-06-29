import { relations } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { Organization, organization } from "../organization";
import { AnatomicalIssue, anatomicalIssue } from "./anatomicalIssue";
import {
  AdvancedReportRecommendations,
  advancedReportRecommendations,
} from "./advancedReportRecommantations";
import { pets, Pet } from "../pets";
import { appointments, Appointment } from "../appointments";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const reportStatus = pgEnum("reportStatus", [
  "draft",
  "finalized",
  "sent",
]);

export const advancedReport = pgTable("advancedReport", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdBy: text("createdBy").references(() => organization.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  consultationReason: text("consultationReason").notNull().default(""),
  patientId: text("patientId").references(() => pets.id, {
    onDelete: "cascade",
  }),
  appointmentId: text("appointmentId").references(() => appointments.id, {
    onDelete: "cascade",
  }),
  notes: text("notes").default(""),
  status: reportStatus("status").notNull().default("draft"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
});

export const advancedReportRelations = relations(
  advancedReport,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [advancedReport.createdBy],
      references: [organization.id],
    }),
    anatomicalIssues: many(anatomicalIssue),
    recommendations: many(advancedReportRecommendations),
    patient: one(pets, {
      fields: [advancedReport.patientId],
      references: [pets.id],
    }),
    appointment: one(appointments, {
      fields: [advancedReport.appointmentId],
      references: [appointments.id],
    }),
  }),
);

export const advancedReportSchema = createInsertSchema(advancedReport);
export const advancedReportSelectSchema = createSelectSchema(advancedReport);

export type AdvancedReport = InferSelectModel<typeof advancedReport> & {
  organization: Organization;
  anatomicalIssues: AnatomicalIssue[];
  recommendations: AdvancedReportRecommendations[];
  patient: Pet;
  appointment?: Appointment | null;
};
export type CreateAdvancedReport = typeof advancedReport.$inferInsert;
