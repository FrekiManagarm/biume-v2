import type { CaptureAction } from './capture-list-view';
import type { CaptureRepository } from './capture-repository';
import type { LocalCaptureErrorCode } from './local-capture';

export type CaptureActionPorts = {
  repository: CaptureRepository;
  api: { cancelCapture(captureId: string): Promise<unknown> };
  deleteFile(uri: string): Promise<void>;
  requestSync(): Promise<void>;
  /** Opens the sign-in screen; the requeue happens once a session is back. */
  openSignIn(): void;
  restartRecording(context: {
    appointmentId: string | null;
    patientId: string | null;
  }): void;
  now(): Date;
};

/**
 * Codes a retry can actually resolve. Everything else needs the practitioner to
 * do something first — sign in again, or record the dictation anew.
 */
const retryableCodes = new Set<LocalCaptureErrorCode>([
  'network',
  'rate_limited',
  'server_error',
  'storage_unavailable',
  'object_incomplete',
  'upload_url_expired',
  'unknown',
]);

/** Blocked by the session rather than by the capture itself. */
const sessionCodes = new Set<LocalCaptureErrorCode>([
  'unauthorized',
  'active_organization_required',
]);

export async function runCaptureAction(
  captureId: string,
  action: CaptureAction,
  ports: CaptureActionPorts,
): Promise<void> {
  const capture = await ports.repository.get(captureId);
  if (!capture) return;
  const at = ports.now().toISOString();

  if (action === 'retry') {
    // The attempt counter is deliberately kept, so the automatic threshold
    // still reflects what this capture has already cost.
    const code = capture.lastErrorCode;
    if (code !== null && !retryableCodes.has(code)) return;
    await ports.repository.transition(captureId, ['needs_action'], {
      status: 'queued',
      nextAttemptAt: null,
      updatedAt: at,
    });
    await ports.requestSync();
    return;
  }

  if (action === 'reconnect') {
    // Nothing local is touched: the audio is exactly what the practitioner is
    // signing back in to save.
    ports.openSignIn();
    return;
  }

  if (action === 'redo') {
    const removed = await ports.repository.transition(
      captureId,
      ['needs_action', 'queued', 'expired'],
      { status: 'cancelled', updatedAt: at },
    );
    if (!removed) return;

    await ports.deleteFile(capture.encryptedFileUri).catch(() => undefined);
    await ports.repository.remove(captureId);
    ports.restartRecording({
      appointmentId: capture.appointmentId,
      patientId: capture.patientId,
    });
    return;
  }

  // Cancel locally first: once that is durably recorded the capture can never
  // be resurrected, whatever happens to the server call or the file deletion.
  const cancelled = await ports.repository.transition(
    captureId,
    ['queued', 'needs_action', 'expired', 'uploaded'],
    { status: 'cancelled', updatedAt: at },
  );
  if (!cancelled) return;

  // A failed server cancellation stays a pending cleanup; it must not bring
  // the capture back into the list.
  await ports.api.cancelCapture(captureId).catch(() => undefined);
  await ports.deleteFile(capture.encryptedFileUri).catch(() => undefined);
}

export type CaptureAttachment = {
  appointmentId: string | null;
  patientId: string | null;
};

/**
 * Changes what a dictation is attached to, before it is validated.
 *
 * Only a capture still in `review` can be reattached. Past that point the
 * identity may already exist on the server with this context, and rewriting it
 * on the device would leave the two disagreeing about the same capture id.
 */
export async function updateCaptureAttachment(
  captureId: string,
  attachment: CaptureAttachment,
  ports: { repository: CaptureRepository; now: Date },
): Promise<boolean> {
  return ports.repository.transition(captureId, ['review'], {
    appointmentId: attachment.appointmentId,
    patientId: attachment.patientId,
    updatedAt: ports.now.toISOString(),
  });
}

/**
 * Returns to the queue the captures that were only ever blocked by an expired
 * session. Called once a valid session is back, which is the other half of the
 * `reconnect` action.
 */
export async function requeueAfterSignIn(
  repository: CaptureRepository,
  now: Date,
): Promise<number> {
  const at = now.toISOString();
  let requeued = 0;

  for (const capture of await repository.list()) {
    if (
      capture.status !== 'needs_action' ||
      capture.lastErrorCode === null ||
      !sessionCodes.has(capture.lastErrorCode)
    ) {
      continue;
    }

    const moved = await repository.transition(capture.id, ['needs_action'], {
      status: 'queued',
      lastErrorCode: null,
      nextAttemptAt: null,
      updatedAt: at,
    });
    if (moved) requeued += 1;
  }

  return requeued;
}
