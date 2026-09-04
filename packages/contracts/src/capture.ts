import { z } from "zod";

/**
 * The species a patient can actually be, mirroring the `animals.code`
 * catalogue. This is deliberately not `animalTypes` from `./report`: that enum
 * describes the three species the anatomical atlas covers, which is a narrower
 * and unrelated concept. Using it here would reject a rabbit or a cow from the
 * agenda.
 */
export const patientSpeciesCodes = [
  "DOG",
  "CAT",
  "HORSE",
  "RABBIT",
  "NAC",
  "COW",
  "OTHER",
] as const;
export const patientSpeciesSchema = z.enum(patientSpeciesCodes);
export type PatientSpecies = z.infer<typeof patientSpeciesSchema>;

export const captureMimeType = "audio/mp4" as const;
export const captureMaxDurationMs = 600_000;
export const captureMaxBytes = 16 * 1024 * 1024;
export const captureUploadUrlTtlSeconds = 600;
export const captureRetentionMs = 24 * 60 * 60 * 1000;
export const captureMaxAutomaticFailures = 5;

export const serverCaptureStatuses = [
  "pending_upload",
  "uploading",
  "uploaded",
  "retryable_failure",
  "cancelled",
  "expired",
] as const;
export const serverCaptureStatusSchema = z.enum(serverCaptureStatuses);
export type ServerCaptureStatus = z.infer<typeof serverCaptureStatusSchema>;

export const localCaptureStatuses = [
  "recording",
  "review",
  "queued",
  "uploading",
  "uploaded",
  "needs_action",
  "cancelled",
  "expired",
] as const;
export const localCaptureStatusSchema = z.enum(localCaptureStatuses);
export type LocalCaptureStatus = z.infer<typeof localCaptureStatusSchema>;

export const captureErrorCodes = [
  "validation",
  "unauthorized",
  "active_organization_required",
  "forbidden",
  "method_not_allowed",
  "not_found",
  "conflict",
  "rate_limited",
  "server_error",
  "storage_unavailable",
  "object_incomplete",
  "expired",
  "network",
  "unknown",
] as const;
export const captureErrorCodeSchema = z.enum(captureErrorCodes);
export type CaptureErrorCode = z.infer<typeof captureErrorCodeSchema>;

const isoDateTimeSchema = z.iso.datetime();
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/);

/**
 * The mobile owns the capture identity and the audio fingerprint. Everything
 * that decides tenancy is resolved from the session, so this schema is strict:
 * an organization or practitioner identifier sent by the client is a rejected
 * payload, not an ignored field.
 */
export const createCaptureRequestSchema = z
  .object({
    id: z.uuid(),
    appointmentId: z.string().min(1).nullable(),
    durationMs: z.number().int().positive().max(captureMaxDurationMs),
    mimeType: z.literal(captureMimeType),
    byteSize: z.number().int().positive().max(captureMaxBytes),
    sha256: sha256Schema,
    createdAt: isoDateTimeSchema,
  })
  .strict();
export type CreateCaptureRequest = z.infer<typeof createCaptureRequestSchema>;

export const captureResponseSchema = z
  .object({
    id: z.uuid(),
    organizationId: z.string().min(1),
    practitionerId: z.string().min(1),
    appointmentId: z.string().min(1).nullable(),
    patientId: z.string().min(1).nullable(),
    reportId: z.string().min(1).nullable(),
    durationMs: z.number().int().positive().max(captureMaxDurationMs),
    mimeType: z.literal(captureMimeType),
    byteSize: z.number().int().positive().max(captureMaxBytes),
    sha256: sha256Schema,
    objectKey: z.string().min(1),
    objectEtag: z.string().min(1).nullable(),
    status: serverCaptureStatusSchema,
    attemptCount: z.number().int().nonnegative(),
    lastErrorCode: captureErrorCodeSchema.nullable(),
    createdAt: isoDateTimeSchema,
    uploadedAt: isoDateTimeSchema.nullable(),
    expiresAt: isoDateTimeSchema,
    purgedAt: isoDateTimeSchema.nullable(),
  })
  .strict();
export type CaptureResponse = z.infer<typeof captureResponseSchema>;

export const uploadSessionResponseSchema = z
  .object({
    method: z.literal("PUT"),
    url: z.url(),
    headers: z.record(z.string(), z.string()),
    expiresAt: isoDateTimeSchema,
  })
  .strict();
export type UploadSessionResponse = z.infer<typeof uploadSessionResponseSchema>;

export const completeCaptureRequestSchema = z
  .object({
    etag: z.string().min(1),
  })
  .strict();
export type CompleteCaptureRequest = z.infer<
  typeof completeCaptureRequestSchema
>;

/**
 * Rattache une capture libre à un animal. Le serveur crée le brouillon de
 * rapport : le mobile ne choisit jamais un identifiant de rapport lui-même.
 */
export const attachCaptureRequestSchema = z
  .object({ patientId: z.string().min(1) })
  .strict();
export type AttachCaptureRequest = z.infer<typeof attachCaptureRequestSchema>;

/** Réponse de « Valider la transcription » : l'extraction est lancée. */
export const extractCaptureResponseSchema = z
  .object({ captureId: z.uuid(), reportId: z.string().min(1) })
  .strict();
export type ExtractCaptureResponse = z.infer<typeof extractCaptureResponseSchema>;

export const mobileOrganizationSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
  })
  .strict();

export const mobileSessionResponseSchema = z
  .object({
    userId: z.string().min(1),
    organization: mobileOrganizationSchema.nullable(),
    canUploadCaptures: z.boolean(),
  })
  .strict();
export type MobileSessionResponse = z.infer<typeof mobileSessionResponseSchema>;

export const mobileAppointmentStatuses = [
  "CREATED",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
] as const;

/**
 * Only the context the capture screen needs to name what is being recorded.
 * Owner contact details and the appointment note stay on the server.
 */
export const mobileAppointmentSchema = z
  .object({
    id: z.string().min(1),
    patientId: z.string().min(1),
    patientName: z.string().min(1),
    animalType: patientSpeciesSchema,
    beginAt: isoDateTimeSchema,
    endAt: isoDateTimeSchema,
    status: z.enum(mobileAppointmentStatuses),
  })
  .strict();
export type MobileAppointment = z.infer<typeof mobileAppointmentSchema>;

export const mobileAppointmentsPageSize = 50;

export const mobileAppointmentsResponseSchema = z
  .object({
    items: z.array(mobileAppointmentSchema).max(mobileAppointmentsPageSize),
    nextCursor: z.string().min(1).nullable(),
  })
  .strict();
export type MobileAppointmentsResponse = z.infer<
  typeof mobileAppointmentsResponseSchema
>;

export const mobileCapturesResponseSchema = z
  .object({
    items: z.array(captureResponseSchema),
    nextCursor: z.string().min(1).nullable(),
  })
  .strict();
export type MobileCapturesResponse = z.infer<
  typeof mobileCapturesResponseSchema
>;

export const mobileApiErrorSchema = z
  .object({
    code: captureErrorCodeSchema,
    message: z.string().min(1),
    retryable: z.boolean(),
    retryAt: isoDateTimeSchema.optional(),
  })
  .strict();
export type MobileApiError = z.infer<typeof mobileApiErrorSchema>;

/**
 * A capture reaches `uploaded` only through `uploading`, so the server never
 * confirms an object for which it did not issue an upload session. `cancelled`
 * and `expired` are terminal.
 */
const allowedServerTransitions = {
  pending_upload: ["uploading", "cancelled", "expired"],
  uploading: ["uploaded", "retryable_failure", "cancelled", "expired"],
  retryable_failure: ["uploading", "cancelled", "expired"],
  uploaded: ["expired"],
  cancelled: [],
  expired: [],
} as const satisfies Record<ServerCaptureStatus, readonly ServerCaptureStatus[]>;

export function canTransitionServerCapture(
  from: ServerCaptureStatus,
  to: ServerCaptureStatus,
): boolean {
  return allowedServerTransitions[from].some((allowed) => allowed === to);
}
