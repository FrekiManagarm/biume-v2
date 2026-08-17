import { z } from "zod";
import {
  reportSectionIds,
  resolvedReportSectionStateValues,
} from "./report";

export const productEventNames = [
  "capture_started",
  "capture_completed",
  "capture_queued_offline",
  "capture_uploaded",
  "transcript_ready",
  "transcript_approved",
  "report_proposal_ready",
  "report_ready_for_review",
  "report_created",
  "report_section_resolved",
  "report_finalized",
  "report_shared",
  "followup_scheduled",
  "followup_sent",
  "owner_response_submitted",
  "followup_action_acknowledged",
  "followup_action_resolved",
] as const;
export const productEventNameSchema = z.enum(productEventNames);
export type ProductEventName = z.infer<typeof productEventNameSchema>;

export const productEventSources = [
  "web_existing_patient",
  "web_quick_create",
  "mobile_appointment",
  "mobile_free_capture",
] as const;

export const productEventPlatforms = ["ios", "android"] as const;
const sourceSchema = z.enum(productEventSources);
const reportSectionSchema = z.enum(reportSectionIds);

const safePropertiesSchema = z
  .object({
    reportId: z.string().optional(),
    captureId: z.string().optional(),
    followupId: z.string().optional(),
    durationMs: z.number().int().nonnegative().optional(),
    byteSize: z.number().int().nonnegative().optional(),
    platform: z.enum(productEventPlatforms).optional(),
    // Constrained to a version triple so the field cannot become a free-text
    // channel into telemetry.
    appVersion: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/)
      .optional(),
    sectionCount: z.number().int().nonnegative().optional(),
    acceptedCount: z.number().int().nonnegative().optional(),
    modifiedCount: z.number().int().nonnegative().optional(),
    rejectedCount: z.number().int().nonnegative().optional(),
    online: z.boolean().optional(),
    journeyType: z.enum(["appointment", "free_capture"]).optional(),
    errorCategory: z
      .enum([
        "permission_denied",
        "network",
        "storage",
        "upload",
        "transcription",
        "extraction",
        "authorization",
        "validation",
        "delivery",
        "unknown",
      ])
      .optional(),
    source: sourceSchema.optional(),
    section: reportSectionSchema.optional(),
    state: z.enum(resolvedReportSectionStateValues).optional(),
    reportRevision: z.number().int().positive().optional(),
  })
  .strict();

export const productEventSchema = z.object({
  name: productEventNameSchema,
  properties: safePropertiesSchema,
});
export type ProductEvent = z.infer<typeof productEventSchema>;
