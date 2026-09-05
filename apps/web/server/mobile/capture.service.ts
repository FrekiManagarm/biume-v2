import {
  captureMimeType,
  captureRetentionMs,
  captureUploadUrlTtlSeconds,
  type CaptureErrorCode,
  type CaptureResponse,
  type CompleteCaptureRequest,
  type CreateCaptureRequest,
  type ServerCaptureStatus,
  type UploadSessionResponse,
} from "@biume/contracts/capture";
import type { AudioCapture, CreateAudioCapture } from "@biume/db/schema/index";
import type { AudioObjectStore } from "./audio-object-store";

export type CaptureActor = {
  practitionerId: string;
  organizationId: string;
};

export type CaptureScope = {
  id: string;
  organizationId: string;
};

export type AppointmentCaptureContext = {
  patientId: string | null;
  reportId: string | null;
};

export type CaptureTransition = CaptureScope & {
  from: readonly ServerCaptureStatus[];
  to: ServerCaptureStatus;
  patch?: Partial<
    Pick<
      AudioCapture,
      | "objectEtag"
      | "uploadedAt"
      | "attemptCount"
      | "lastErrorCode"
      | "purgedAt"
      | "updatedAt"
    >
  >;
};

export type CaptureRepository = {
  findCapture(scope: CaptureScope): Promise<AudioCapture | null>;
  insertCapture(row: CreateAudioCapture): Promise<AudioCapture | null>;
  findAppointmentContext(scope: {
    appointmentId: string;
    organizationId: string;
  }): Promise<AppointmentCaptureContext | null>;
  /**
   * Applies the transition only when the stored status is still one of `from`.
   * A `null` result means the predicate did not match, which is how a late
   * completion is prevented from reviving a cancelled or expired capture.
   */
  transitionCapture(input: CaptureTransition): Promise<AudioCapture | null>;
};

export type CaptureServiceDependencies = {
  repository: CaptureRepository;
  objectStore: AudioObjectStore;
  now: () => Date;
  hashOrganizationId: (organizationId: string) => string;
  /**
   * Appelé après qu'une dictée est confirmée dans le stockage. Facultatif : la
   * capture n'a pas à savoir ce qui se passe ensuite, et les tests existants
   * n'ont pas à le fournir.
   */
  onCaptureUploaded?: (captureId: string) => Promise<void>;
};

/**
 * Precise domain reason kept for logs and telemetry. It never crosses the HTTP
 * boundary; only `code` does.
 */
export type CaptureFailureReason =
  | "capture_identity_conflict"
  | "capture_not_found"
  | "appointment_not_found"
  | "capture_not_uploadable"
  | "capture_not_completable"
  | "object_missing"
  | "object_mismatch";

export class CaptureServiceError extends Error {
  readonly code: CaptureErrorCode;
  readonly reason: CaptureFailureReason;
  readonly retryable: boolean;

  constructor(
    code: CaptureErrorCode,
    reason: CaptureFailureReason,
    options: { retryable?: boolean } = {},
  ) {
    super(reason);
    this.name = "CaptureServiceError";
    this.code = code;
    this.reason = reason;
    this.retryable = options.retryable ?? false;
  }
}

const uploadableStatuses = [
  "pending_upload",
  "uploading",
  "retryable_failure",
] as const satisfies readonly ServerCaptureStatus[];

function buildObjectKey(
  organizationHash: string,
  captureId: string,
): string {
  return `captures/${organizationHash}/${captureId}/audio.m4a`;
}

/**
 * The identity of a capture is its audio, not the row that happens to exist.
 * Two requests carrying the same id must describe the same recording, or the
 * second one is a conflict rather than an overwrite.
 */
function hasSameIdentity(
  row: AudioCapture,
  request: CreateCaptureRequest,
): boolean {
  return (
    row.sha256 === request.sha256 &&
    row.durationMs === request.durationMs &&
    row.byteSize === request.byteSize &&
    row.mimeType === request.mimeType &&
    (row.appointmentId ?? null) === (request.appointmentId ?? null)
  );
}

export function toCaptureResponse(row: AudioCapture): CaptureResponse {
  return {
    id: row.id,
    organizationId: row.organizationId,
    practitionerId: row.practitionerId,
    appointmentId: row.appointmentId,
    patientId: row.patientId,
    reportId: row.reportId,
    durationMs: row.durationMs,
    mimeType: captureMimeType,
    byteSize: row.byteSize,
    sha256: row.sha256,
    objectKey: row.objectKey,
    objectEtag: row.objectEtag,
    status: row.status,
    attemptCount: row.attemptCount,
    lastErrorCode: row.lastErrorCode as CaptureResponse["lastErrorCode"],
    createdAt: row.createdAt.toISOString(),
    uploadedAt: row.uploadedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt.toISOString(),
    purgedAt: row.purgedAt?.toISOString() ?? null,
  };
}

async function requireCapture(
  actor: CaptureActor,
  captureId: string,
  dependencies: CaptureServiceDependencies,
): Promise<AudioCapture> {
  const row = await dependencies.repository.findCapture({
    id: captureId,
    organizationId: actor.organizationId,
  });
  if (!row) {
    throw new CaptureServiceError("not_found", "capture_not_found");
  }
  return row;
}

export async function createCapture(
  actor: CaptureActor,
  request: CreateCaptureRequest,
  dependencies: CaptureServiceDependencies,
): Promise<CaptureResponse> {
  const scope = { id: request.id, organizationId: actor.organizationId };

  const existing = await dependencies.repository.findCapture(scope);
  if (existing) {
    if (!hasSameIdentity(existing, request)) {
      throw new CaptureServiceError("conflict", "capture_identity_conflict");
    }
    return toCaptureResponse(existing);
  }

  let context: AppointmentCaptureContext = { patientId: null, reportId: null };
  if (request.appointmentId) {
    const appointment = await dependencies.repository.findAppointmentContext({
      appointmentId: request.appointmentId,
      organizationId: actor.organizationId,
    });
    if (!appointment) {
      throw new CaptureServiceError("not_found", "appointment_not_found");
    }
    context = appointment;
  }

  const now = dependencies.now();
  const inserted = await dependencies.repository.insertCapture({
    id: request.id,
    organizationId: actor.organizationId,
    practitionerId: actor.practitionerId,
    appointmentId: request.appointmentId,
    patientId: context.patientId,
    reportId: context.reportId,
    durationMs: request.durationMs,
    mimeType: request.mimeType,
    byteSize: request.byteSize,
    sha256: request.sha256,
    objectKey: buildObjectKey(
      dependencies.hashOrganizationId(actor.organizationId),
      request.id,
    ),
    status: "pending_upload",
    attemptCount: 0,
    // Retention is measured from the moment the server learns of the capture,
    // so an offline client cannot extend or shorten its own window.
    createdAt: now,
    expiresAt: new Date(now.getTime() + captureRetentionMs),
    updatedAt: now,
  });
  if (inserted) return toCaptureResponse(inserted);

  const concurrent = await dependencies.repository.findCapture(scope);
  if (!concurrent || !hasSameIdentity(concurrent, request)) {
    throw new CaptureServiceError("conflict", "capture_identity_conflict");
  }
  return toCaptureResponse(concurrent);
}

export async function createUploadSession(
  actor: CaptureActor,
  captureId: string,
  dependencies: CaptureServiceDependencies,
): Promise<UploadSessionResponse> {
  const capture = await requireCapture(actor, captureId, dependencies);

  if (!uploadableStatuses.some((status) => status === capture.status)) {
    throw new CaptureServiceError("conflict", "capture_not_uploadable");
  }

  const signed = await dependencies.objectStore.createPutUrl({
    key: capture.objectKey,
    contentType: captureMimeType,
    byteSize: capture.byteSize,
    sha256: capture.sha256,
    expiresInSeconds: captureUploadUrlTtlSeconds,
  });

  // Renewal reuses the same row and the same object key; only the attempt
  // counter and the status move.
  await dependencies.repository.transitionCapture({
    id: capture.id,
    organizationId: actor.organizationId,
    from: uploadableStatuses,
    to: "uploading",
    patch: {
      attemptCount: capture.attemptCount + 1,
      updatedAt: dependencies.now(),
    },
  });

  return {
    method: "PUT",
    url: signed.url,
    headers: signed.headers,
    expiresAt: signed.expiresAt.toISOString(),
  };
}

export async function completeCapture(
  actor: CaptureActor,
  captureId: string,
  request: CompleteCaptureRequest,
  dependencies: CaptureServiceDependencies,
): Promise<CaptureResponse> {
  const capture = await requireCapture(actor, captureId, dependencies);

  if (capture.status === "uploaded") return toCaptureResponse(capture);
  if (capture.status !== "uploading") {
    throw new CaptureServiceError("conflict", "capture_not_completable");
  }

  const stored = await dependencies.objectStore.head(capture.objectKey);
  const matches =
    stored !== null &&
    stored.etag === request.etag &&
    stored.contentType === captureMimeType &&
    stored.byteSize === capture.byteSize &&
    stored.metadata.sha256 === capture.sha256;

  if (!matches) {
    const now = dependencies.now();
    await dependencies.repository.transitionCapture({
      id: capture.id,
      organizationId: actor.organizationId,
      from: ["uploading"],
      to: "retryable_failure",
      patch: { lastErrorCode: "object_incomplete", updatedAt: now },
    });
    throw new CaptureServiceError(
      "object_incomplete",
      stored === null ? "object_missing" : "object_mismatch",
      { retryable: true },
    );
  }

  const now = dependencies.now();
  const confirmed = await dependencies.repository.transitionCapture({
    id: capture.id,
    organizationId: actor.organizationId,
    from: ["uploading"],
    to: "uploaded",
    patch: {
      objectEtag: request.etag,
      uploadedAt: now,
      lastErrorCode: null,
      updatedAt: now,
    },
  });
  if (!confirmed) {
    throw new CaptureServiceError("conflict", "capture_not_completable");
  }

  // Déclenché après la transition, jamais avant : une transcription lancée sur
  // une capture dont la confirmation a échoué lirait un objet incomplet.
  await dependencies.onCaptureUploaded?.(confirmed.id);

  return toCaptureResponse(confirmed);
}

export async function cancelCapture(
  actor: CaptureActor,
  captureId: string,
  dependencies: CaptureServiceDependencies,
): Promise<void> {
  const capture = await requireCapture(actor, captureId, dependencies);
  const now = dependencies.now();

  if (capture.status !== "cancelled") {
    await dependencies.repository.transitionCapture({
      id: capture.id,
      organizationId: actor.organizationId,
      from: ["pending_upload", "uploading", "uploaded", "retryable_failure"],
      to: "cancelled",
      patch: { updatedAt: now },
    });
  }

  // Purging is safe to repeat: a cancelled capture must leave no object behind
  // even if an upload landed after the cancellation.
  await dependencies.objectStore.delete(capture.objectKey);
}
