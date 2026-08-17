import { captureRetentionMs } from '@biume/contracts/capture';
import {
  LocalCaptureInvariantError,
  captureBackoffCapMs,
  captureMaxAutomaticFailures,
  computeBackoffMs,
  canTransitionLocalCapture,
  isLocalCaptureExpired,
  localExpiresAt,
  registerUploadFailure,
  selectNextEligibleCapture,
  transitionLocalCapture,
  type LocalCapture,
} from './local-capture';

const now = new Date('2026-07-19T10:00:00.000Z');

function buildCapture(overrides: Partial<LocalCapture> = {}): LocalCapture {
  return {
    id: '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70',
    appointmentId: null,
    patientId: null,
    encryptedFileUri: 'file:///captures/capture-1.bin',
    durationMs: 120_000,
    mimeType: 'audio/mp4',
    byteSize: 1_048_576,
    sha256: 'a'.repeat(64),
    status: 'review',
    remoteStatus: null,
    attemptCount: 0,
    nextAttemptAt: null,
    lastErrorCode: null,
    createdAt: now.toISOString(),
    validatedAt: null,
    expiresAt: new Date(now.getTime() + captureRetentionMs).toISOString(),
    updatedAt: now.toISOString(),
    ...overrides,
  };
}

describe('local capture transitions', () => {
  it('validates a reviewed dictation into the queue', () => {
    expect(canTransitionLocalCapture('review', 'queued')).toBe(true);
  });

  it('refuses to queue anything that was not reviewed', () => {
    expect(canTransitionLocalCapture('recording', 'queued')).toBe(false);
    expect(canTransitionLocalCapture('uploaded', 'queued')).toBe(false);
    expect(canTransitionLocalCapture('cancelled', 'queued')).toBe(false);
    expect(canTransitionLocalCapture('expired', 'queued')).toBe(false);
  });

  it('lets a queued capture start and finish uploading', () => {
    expect(canTransitionLocalCapture('queued', 'uploading')).toBe(true);
    expect(canTransitionLocalCapture('uploading', 'uploaded')).toBe(true);
  });

  it('returns a failed upload to the queue', () => {
    expect(canTransitionLocalCapture('uploading', 'queued')).toBe(true);
  });

  it('lets a recovered capture leave needs_action', () => {
    expect(canTransitionLocalCapture('needs_action', 'queued')).toBe(true);
  });

  it('treats cancellation and expiry as terminal', () => {
    expect(canTransitionLocalCapture('cancelled', 'uploaded')).toBe(false);
    expect(canTransitionLocalCapture('expired', 'uploaded')).toBe(false);
    expect(canTransitionLocalCapture('cancelled', 'expired')).toBe(false);
  });

  it('applies a legal transition with its patch', () => {
    const capture = buildCapture({ status: 'review' });

    const queued = transitionLocalCapture(capture, 'queued', {
      validatedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    expect(queued.status).toBe('queued');
    expect(queued.validatedAt).toBe(now.toISOString());
  });

  it('refuses an illegal transition instead of silently accepting it', () => {
    const capture = buildCapture({ status: 'cancelled' });

    expect(() => transitionLocalCapture(capture, 'uploaded')).toThrow(
      LocalCaptureInvariantError,
    );
  });
});

describe('upload eligibility', () => {
  it('takes the oldest validated capture first', () => {
    const older = buildCapture({
      id: 'older',
      status: 'queued',
      createdAt: '2026-07-19T08:00:00.000Z',
    });
    const newer = buildCapture({
      id: 'newer',
      status: 'queued',
      createdAt: '2026-07-19T09:00:00.000Z',
    });

    expect(
      selectNextEligibleCapture([newer, older], now.toISOString())?.id,
    ).toBe('older');
  });

  it('ignores a capture waiting for its backoff window', () => {
    const waiting = buildCapture({
      status: 'queued',
      nextAttemptAt: '2026-07-19T10:05:00.000Z',
    });

    expect(selectNextEligibleCapture([waiting], now.toISOString())).toBeNull();
  });

  it('takes a capture whose backoff window has elapsed', () => {
    const ready = buildCapture({
      status: 'queued',
      nextAttemptAt: '2026-07-19T09:59:00.000Z',
    });

    expect(selectNextEligibleCapture([ready], now.toISOString())?.id).toBe(
      ready.id,
    );
  });

  it('never picks a capture that is not queued', () => {
    const statuses = [
      'recording',
      'review',
      'uploading',
      'uploaded',
      'needs_action',
      'cancelled',
      'expired',
    ] as const;

    for (const status of statuses) {
      expect(
        selectNextEligibleCapture([buildCapture({ status })], now.toISOString()),
      ).toBeNull();
    }
  });
});

describe('backoff', () => {
  it('grows exponentially between attempts', () => {
    const random = () => 0;

    expect(computeBackoffMs(1, random)).toBe(500);
    expect(computeBackoffMs(2, random)).toBe(1_000);
    expect(computeBackoffMs(3, random)).toBe(2_000);
  });

  it('spreads retries with jitter inside the attempt window', () => {
    expect(computeBackoffMs(3, () => 0)).toBe(2_000);
    expect(computeBackoffMs(3, () => 0.5)).toBe(3_000);
    expect(computeBackoffMs(3, () => 0.999)).toBeLessThanOrEqual(4_000);
  });

  it('never waits longer than the cap', () => {
    expect(computeBackoffMs(50, () => 1)).toBeLessThanOrEqual(
      captureBackoffCapMs,
    );
  });
});

describe('failure handling', () => {
  it('schedules the next attempt after a recoverable failure', () => {
    const capture = buildCapture({ status: 'uploading', attemptCount: 0 });

    const failed = registerUploadFailure(capture, 'network', now, () => 0);

    expect(failed.status).toBe('queued');
    expect(failed.attemptCount).toBe(1);
    expect(failed.lastErrorCode).toBe('network');
    expect(failed.nextAttemptAt).toBe(
      new Date(now.getTime() + 500).toISOString(),
    );
  });

  it('asks the practitioner for help after the automatic threshold', () => {
    const capture = buildCapture({
      status: 'uploading',
      attemptCount: captureMaxAutomaticFailures - 1,
    });

    const failed = registerUploadFailure(capture, 'server_error', now, () => 0);

    expect(failed.attemptCount).toBe(captureMaxAutomaticFailures);
    expect(failed.status).toBe('needs_action');
    expect(failed.nextAttemptAt).toBeNull();
  });

  it('never counts a session expiry as an automatic retry', () => {
    const capture = buildCapture({ status: 'uploading', attemptCount: 2 });

    const failed = registerUploadFailure(capture, 'unauthorized', now, () => 0);

    expect(failed.status).toBe('needs_action');
    expect(failed.attemptCount).toBe(2);
  });

  it('keeps the encrypted file whatever the failure', () => {
    const capture = buildCapture({ status: 'uploading' });

    expect(
      registerUploadFailure(capture, 'server_error', now, () => 0)
        .encryptedFileUri,
    ).toBe(capture.encryptedFileUri);
  });
});

describe('expiry', () => {
  it('expires audio twenty four hours after creation', () => {
    expect(localExpiresAt(now.toISOString())).toBe(
      new Date(now.getTime() + captureRetentionMs).toISOString(),
    );
  });

  it('detects a capture past its retention window', () => {
    const capture = buildCapture({
      expiresAt: '2026-07-19T09:59:59.000Z',
    });

    expect(isLocalCaptureExpired(capture, now.toISOString())).toBe(true);
  });

  it('keeps a capture inside its retention window', () => {
    expect(isLocalCaptureExpired(buildCapture(), now.toISOString())).toBe(false);
  });
});
