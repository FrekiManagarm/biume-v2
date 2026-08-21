import { alertReasons, followUpStatuses } from "@biume/contracts/followup";
import type {
  FollowUpAnswer,
  FollowUpQuestionnaire,
} from "@biume/contracts/followup";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { advancedReport } from "./advancedReport/advancedReport";
import { organization } from "./organization";
import { reportShareLink } from "./ownerAccess";

export const followUpStatus = pgEnum("follow_up_status", followUpStatuses);
export const followUpAlertReason = pgEnum(
  "follow_up_alert_reason",
  alertReasons,
);

/**
 * Un suivi par compte rendu partagé. Le questionnaire est figé au moment de la
 * programmation : modifier le modèle par défaut plus tard ne change pas ce
 * qu'un propriétaire a déjà reçu.
 */
export const followUp = pgTable(
  "follow_up",
  {
    id: text("id").primaryKey(),
    reportId: text("report_id")
      .notNull()
      .references(() => advancedReport.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    shareToken: text("share_token").references(() => reportShareLink.token, {
      onDelete: "set null",
    }),
    status: followUpStatus("status").notNull().default("scheduled"),
    questionnaire: jsonb("questionnaire")
      .$type<FollowUpQuestionnaire>()
      .notNull(),
    answer: jsonb("answer").$type<FollowUpAnswer>(),
    dueAt: timestamp("due_at", { mode: "date" }).notNull(),
    sentAt: timestamp("sent_at", { mode: "date" }),
    answeredAt: timestamp("answered_at", { mode: "date" }),
    /** Posé par le praticien quand il a traité l'alerte. */
    handledAt: timestamp("handled_at", { mode: "date" }),
    lastErrorCode: text("last_error_code"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("follow_up_due_idx").on(table.status, table.dueAt),
    index("follow_up_org_idx").on(table.organizationId, table.status),
  ],
);

export const followUpAlert = pgTable(
  "follow_up_alert",
  {
    id: text("id").primaryKey(),
    followUpId: text("follow_up_id")
      .notNull()
      .references(() => followUp.id, { onDelete: "cascade" }),
    reason: followUpAlertReason("reason").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("follow_up_alert_followup_idx").on(table.followUpId)],
);

export const followUpRelations = relations(followUp, ({ one, many }) => ({
  report: one(advancedReport, {
    fields: [followUp.reportId],
    references: [advancedReport.id],
  }),
  alerts: many(followUpAlert),
}));

export type PersistedFollowUp = typeof followUp.$inferSelect;
