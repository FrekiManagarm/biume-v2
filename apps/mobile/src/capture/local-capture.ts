import {
  captureRetentionMs,
  type CaptureErrorCode,
  type LocalCaptureStatus,
  type ServerCaptureStatus,
} from '@biume/contracts/capture';

export const captureMaxAutomaticFailures = 5;
export const captureBackoffCapMs = 15 * 60 * 1000;

/**
 * Conditions that only exist on the device. They never travel to the server, so
 * they are deliberately kept out of the shared contract, but a row still has to
 * be able to record why it needs the practitioner.
 */
export const localOnlyCaptureErrorCodes = [
  'local_file_missing',
  'local_storage_full',
  'microphone_denied',
] as const;

export type LocalCaptureErrorCode =
  | CaptureErrorCode
  | (typeof localOnlyCaptureErrorCodes)[number];

export type LocalCapture = {
  id: string;
  appointmentId: string | null;
  patientId: string | null;
  encryptedFileUri: string;
  durationMs: number;
  mimeType: 'audio/mp4';
  byteSize: number;
  sha256: string;
  status: LocalCaptureStatus;
  remoteStatus: ServerCaptureStatus | null;
  attemptCount: number;
  nextAttemptAt: string | null;
  lastErrorCode: LocalCaptureErrorCode | null;
  createdAt: string;
  validatedAt: string | null;
  expiresAt: string;
  updatedAt: string;
};

export type LocalCapturePatch = Partial<Omit<LocalCapture, 'id' | 'status'>>;

export class LocalCaptureInvariantError extends Error {
  readonly from: LocalCaptureStatus;
  readonly to: LocalCaptureStatus;

  constructor(from: LocalCaptureStatus, to: LocalCaptureStatus) {
    super(`Transition locale interdite : ${from} -> ${to}`);
    this.name = 'LocalCaptureInvariantError';
    this.from = from;
    this.to = to;
  }
}

/**
 * Only `review` reaches `queued`. Validating a dictation is a deliberate act by
 * the practitioner, so nothing may enqueue audio that was never played back and
 * accepted.
 */
const allowedLocalTransitions = {
  recording: ['review', 'cancelled', 'needs_action'],
  review: ['queued', 'cancelled'],
  queued: ['uploading', 'cancelled', 'expired', 'needs_action'],
  uploading: ['uploaded', 'queued', 'needs_action', 'cancelled', 'expired'],
  uploaded: ['expired'],
  needs_action: ['queued', 'cancelled', 'expired'],
  cancelled: [],
  expired: [],
} as const satisfies Record<LocalCaptureStatus, readonly LocalCaptureStatus[]>;

export function canTransitionLocalCapture(
  from: LocalCaptureStatus,
  to: LocalCaptureStatus,
): boolean {
  return allowedLocalTransitions[from].some((allowed) => allowed === to);
}

export function transitionLocalCapture(
  capture: LocalCapture,
  to: LocalCaptureStatus,
  patch: LocalCapturePatch = {},
): LocalCapture {
  if (!canTransitionLocalCapture(capture.status, to)) {
    throw new LocalCaptureInvariantError(capture.status, to);
  }
  return { ...capture, ...patch, status: to };
}

export function localExpiresAt(createdAt: string): string {
  return new Date(new Date(createdAt).getTime() + captureRetentionMs).toISOString();
}

export function isLocalCaptureExpired(
  capture: LocalCapture,
  now: string,
): boolean {
  return new Date(capture.expiresAt).getTime() <= new Date(now).getTime();
}

/**
 * Full-window jitter: the delay lands anywhere between half and the whole
 * exponential window, so devices that failed together do not retry together.
 */
export function computeBackoffMs(
  attemptCount: number,
  random: () => number,
): number {
  const exponent = Math.max(0, attemptCount - 1);
  const base = Math.min(1000 * 2 ** exponent, captureBackoffCapMs);
  return Math.min(
    captureBackoffCapMs,
    Math.round(base / 2 + random() * (base / 2)),
  );
}

/**
 * Failures that no amount of retrying will fix on its own. They stop the
 * automatic loop immediately and never consume an attempt.
 */
const manualInterventionCodes = new Set<CaptureErrorCode>([
  'unauthorized',
  'active_organization_required',
  'forbidden',
  'conflict',
  'validation',
  'expired',
]);

export function registerUploadFailure(
  capture: LocalCapture,
  errorCode: CaptureErrorCode,
  now: Date,
  random: () => number,
): LocalCapture {
  const timestamp = now.toISOString();

  if (manualInterventionCodes.has(errorCode)) {
    return {
      ...capture,
      status: 'needs_action',
      lastErrorCode: errorCode,
      nextAttemptAt: null,
      updatedAt: timestamp,
    };
  }

  const attemptCount = capture.attemptCount + 1;
  if (attemptCount >= captureMaxAutomaticFailures) {
    return {
      ...capture,
      status: 'needs_action',
      attemptCount,
      lastErrorCode: errorCode,
      nextAttemptAt: null,
      updatedAt: timestamp,
    };
  }

  return {
    ...capture,
    status: 'queued',
    attemptCount,
    lastErrorCode: errorCode,
    nextAttemptAt: new Date(
      now.getTime() + computeBackoffMs(attemptCount, random),
    ).toISOString(),
    updatedAt: timestamp,
  };
}

export function selectNextEligibleCapture(
  captures: readonly LocalCapture[],
  now: string,
): LocalCapture | null {
  const nowMs = new Date(now).getTime();

  const eligible = captures
    .filter(
      (capture) =>
        capture.status === 'queued' &&
        (capture.nextAttemptAt === null ||
          new Date(capture.nextAttemptAt).getTime() <= nowMs),
    )
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );

  return eligible[0] ?? null;
}
