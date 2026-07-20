import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "../organization";
import type { Organization } from "../organization";
import { anatomicalIssue } from "./anatomicalIssue";
import type { AnatomicalIssue } from "./anatomicalIssue";
import { advancedReportRecommendations } from "./advancedReportRecommantations";
import type {
  AdvancedReportRecommendations,
} from "./advancedReportRecommantations";
import { reportOwnerContent } from "./reportOwnerContent";
import type { ReportOwnerContent } from "./reportOwnerContent";
import { reportSectionState } from "./reportSectionState";
import type { PersistedReportSectionState } from "./reportSectionState";
import { reportSharedVersion } from "./reportSharedVersion";
import type { ReportSharedVersion } from "./reportSharedVersion";
import { pets } from "../pets";
import type { Pet } from "../pets";
import { appointments } from "../appointments";
import type { Appointment } from "../appointments";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { reportStatuses } from "@biume/contracts/report";

export const reportStatus = pgEnum("reportStatus", reportStatuses);

export const advancedReport = pgTable(
  "advancedReport",
  {
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
    revision: integer("revision").notNull().default(1),
    clientRequestId: text("client_request_id"),
    quickRequestFingerprint: text("quick_request_fingerprint"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }),
  },
  (table) => [
    uniqueIndex("advanced_report_quick_request_unique").on(
      table.createdBy,
      table.clientRequestId,
    ),
  ],
);

export const advancedReportRelations = relations(
  advancedReport,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [advancedReport.createdBy],
      references: [organization.id],
    }),
    anatomicalIssues: many(anatomicalIssue),
    recommendations: many(advancedReportRecommendations),
    ownerContents: many(reportOwnerContent),
    sectionStates: many(reportSectionState),
    sharedVersions: many(reportSharedVersion),
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

export type AdvancedReport = InferSelectModel<typeof advancedReport>;

export type AdvancedReportRelationMap = {
  organization: Organization | null;
  anatomicalIssues: AnatomicalIssue[];
  recommendations: AdvancedReportRecommendations[];
  ownerContents: ReportOwnerContent[];
  sectionStates: PersistedReportSectionState[];
  sharedVersions: ReportSharedVersion[];
  patient: Pet | null;
  appointment: Appointment | null;
};

export type AdvancedReportWithRelations<
  Relation extends keyof AdvancedReportRelationMap = keyof AdvancedReportRelationMap,
> = AdvancedReport & Pick<AdvancedReportRelationMap, Relation>;
export type CreateAdvancedReport = typeof advancedReport.$inferInsert;
