import { captureMaxDurationMs } from '@biume/contracts/capture';
import type { SealedRecording } from '../capture/capture-files';
import { localExpiresAt, type LocalCapture } from '../capture/local-capture';
import { biumeRecordingPreset } from './recording-session';
import type { InterruptedSession } from './recording-session';

/**
 * A crash takes the recorder's own duration with it, so the only thing left to
 * read the length from is the file. The encoder runs at a constant bitrate,
 * which makes size a fair proxy — and the value is a display estimate, not an
 * integrity check: the server verifies size and fingerprint, never duration.
 */
export function estimateDurationMs(byteSize: number): number {
  const bytesPerMs = biumeRecordingPreset.bitRate / 8 / 1000;
  const estimate = Math.round(byteSize / bytesPerMs);
  return Math.min(captureMaxDurationMs, Math.max(1, estimate));
}

export function buildRecoveredCapture(input: {
  session: InterruptedSession;
  sealed: SealedRecording;
  now: Date;
}): LocalCapture {
  const { session, sealed } = input;

  return {
    id: session.captureId,
    appointmentId: session.appointmentId,
    patientId: session.patientId,
    encryptedFileUri: sealed.encryptedFileUri,
    durationMs: estimateDurationMs(sealed.byteSize),
    mimeType: 'audio/mp4',
    byteSize: sealed.byteSize,
    sha256: sealed.sha256,
    // Review, never queued: a take the practitioner never heard must not be
    // sent on their behalf.
    status: 'review',
    remoteStatus: null,
    attemptCount: 0,
    nextAttemptAt: null,
    lastErrorCode: null,
    // Retention counts from the recording, not from the recovery, so a crash
    // cannot quietly extend how long audio lives on the device.
    createdAt: session.startedAt,
    validatedAt: null,
    expiresAt: localExpiresAt(session.startedAt),
    updatedAt: input.now.toISOString(),
  };
}
