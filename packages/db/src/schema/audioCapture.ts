import {
  captureMaxBytes,
  captureMaxDurationMs,
  captureMimeType,
  serverCaptureStatuses,
} from "@biume/contracts/capture";
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { advancedReport } from "./advancedReport/advancedReport";
import { appointments } from "./appointments";
import { organization } from "./organization";
import { pets } from "./pets";
import { user } from "./user";

export const audioCaptureStatus = pgEnum(
  "audio_capture_status",
  serverCaptureStatuses,
);

/**
 * One row per dictation. The primary key is the UUID the mobile generates
 * before recording, which is what makes creation idempotent across retries and
 * reinstalls. Tenancy is resolved server-side and never accepted from the
 * client, so every read must filter on `organizationId` as well as `id`.
 *
 * The clinical context is deliberately nullable and detaches on delete: losing
 * an appointment, a patient, or a report must never destroy audio that is still
 * within its retention window.
 */
export const audioCapture = pgTable(
  "audio_capture",
  {
    id: uuid("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    practitionerId: text("practitioner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    appointmentId: text("appointment_id").references(() => appointments.id, {
      onDelete: "set null",
    }),
    patientId: text("patient_id").references(() => pets.id, {
      onDelete: "set null",
    }),
    reportId: text("report_id").references(() => advancedReport.id, {
      onDelete: "set null",
    }),
    durationMs: integer("duration_ms").notNull(),
    mimeType: text("mime_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    sha256: text("sha256").notNull(),
    objectKey: text("object_key").notNull(),
    objectEtag: text("object_etag"),
    status: audioCaptureStatus("status").notNull().default("pending_upload"),
    attemptCount: integer("attempt_count").notNull().default(0),
    lastErrorCode: text("last_error_code"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
    uploadedAt: timestamp("uploaded_at", { mode: "date" }),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    purgedAt: timestamp("purged_at", { mode: "date" }),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("audio_capture_object_key_unique").on(table.objectKey),
    index("audio_capture_org_created_idx").on(
      table.organizationId,
      table.createdAt,
      table.id,
    ),
    index("audio_capture_status_expires_idx").on(table.status, table.expiresAt),
    check(
      "audio_capture_duration_range",
      sql`${table.durationMs} > 0 and ${table.durationMs} <= ${sql.raw(String(captureMaxDurationMs))}`,
    ),
    check(
      "audio_capture_byte_size_range",
      sql`${table.byteSize} > 0 and ${table.byteSize} <= ${sql.raw(String(captureMaxBytes))}`,
    ),
    check(
      "audio_capture_sha256_shape",
      sql`${table.sha256} ~ '^[0-9a-f]{64}$'`,
    ),
    check(
      "audio_capture_mime_type",
      sql`${table.mimeType} = ${sql.raw(`'${captureMimeType}'`)}`,
    ),
    check(
      "audio_capture_attempt_count_non_negative",
      sql`${table.attemptCount} >= 0`,
    ),
  ],
);

export const audioCaptureRelations = relations(audioCapture, ({ one }) => ({
  organization: one(organization, {
    fields: [audioCapture.organizationId],
    references: [organization.id],
  }),
  practitioner: one(user, {
    fields: [audioCapture.practitionerId],
    references: [user.id],
  }),
  appointment: one(appointments, {
    fields: [audioCapture.appointmentId],
    references: [appointments.id],
  }),
  patient: one(pets, {
    fields: [audioCapture.patientId],
    references: [pets.id],
  }),
  report: one(advancedReport, {
    fields: [audioCapture.reportId],
    references: [advancedReport.id],
  }),
}));

export type AudioCapture = typeof audioCapture.$inferSelect;
export type CreateAudioCapture = typeof audioCapture.$inferInsert;
