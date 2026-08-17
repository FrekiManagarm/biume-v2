import { captureRetentionMs } from '@biume/contracts/capture';
import {
  requeueAfterSignIn,
  runCaptureAction,
  updateCaptureAttachment,
  type CaptureActionPorts,
} from './capture-actions';
import type { CaptureRepository } from './capture-repository';
import type { LocalCapture } from './local-capture';

const now = new Date('2026-07-20T12:00:00.000Z');
const captureId = '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70';

function buildCapture(overrides: Partial<LocalCapture> = {}): LocalCapture {
  return {
    id: captureId,
    appointmentId: 'appointment-1',
    patientId: null,
    encryptedFileUri: 'file:///documents/captures/capture-1.biume',
    durationMs: 120_000,
    mimeType: 'audio/mp4',
    byteSize: 1_048_576,
    sha256: 'a'.repeat(64),
    status: 'needs_action',
    remoteStatus: null,
    attemptCount: 5,
    nextAttemptAt: null,
    lastErrorCode: 'network',
    createdAt: '2026-07-20T10:00:00.000Z',
    validatedAt: '2026-07-20T10:01:00.000Z',
    expiresAt: new Date(now.getTime() + captureRetentionMs).toISOString(),
    updatedAt: '2026-07-20T10:01:00.000Z',
    ...overrides,
  };
}

function createRepository(rows: LocalCapture[] = []) {
  const store = new Map(rows.map((row) => [row.id, row]));

  const repository: CaptureRepository = {
    insertReview: jest.fn(async (capture: LocalCapture) => {
      store.set(capture.id, capture);
    }),
    transition: jest.fn(async (id, from, patch) => {
      const row = store.get(id);
      if (!row || !from.includes(row.status)) return false;
      store.set(id, { ...row, ...patch } as LocalCapture);
      return true;
    }),
    get: jest.fn(async (id) => store.get(id) ?? null),
    list: jest.fn(async () => Array.from(store.values())),
    nextEligible: jest.fn(async () => null),
    markExpired: jest.fn(async () => []),
    remove: jest.fn(async (id) => {
      store.delete(id);
    }),
  };

  return { repository, store };
}

function createPorts(repository: CaptureRepository) {
  const deleted: string[] = [];

  const ports: CaptureActionPorts & { deleted: string[] } = {
    repository,
    api: { cancelCapture: jest.fn(async () => undefined) },
    deleteFile: jest.fn(async (uri: string) => {
      deleted.push(uri);
    }),
    requestSync: jest.fn(async () => {}),
    openSignIn: jest.fn(),
    restartRecording: jest.fn(),
    now: () => now,
    deleted,
  };

  return ports;
}

describe('retry', () => {
  it('returns a recoverable capture to the queue and asks for a run', async () => {
    const { repository, store } = createRepository([buildCapture()]);
    const ports = createPorts(repository);

    await runCaptureAction(captureId, 'retry', ports);

    expect(store.get(captureId)?.status).toBe('queued');
    expect(ports.requestSync).toHaveBeenCalled();
  });

  it('keeps the attempts a capture has already cost', async () => {
    const { repository, store } = createRepository([buildCapture()]);

    await runCaptureAction(captureId, 'retry', createPorts(repository));

    expect(store.get(captureId)?.attemptCount).toBe(5);
  });

  it('refuses to retry what retrying cannot fix', async () => {
    const { repository, store } = createRepository([
      buildCapture({ lastErrorCode: 'conflict' }),
    ]);
    const ports = createPorts(repository);

    await runCaptureAction(captureId, 'retry', ports);

    expect(store.get(captureId)?.status).toBe('needs_action');
    expect(ports.requestSync).not.toHaveBeenCalled();
  });
});

describe('reconnect', () => {
  it('sends the practitioner to sign-in', async () => {
    const { repository } = createRepository([
      buildCapture({ lastErrorCode: 'unauthorized' }),
    ]);
    const ports = createPorts(repository);

    await runCaptureAction(captureId, 'reconnect', ports);

    expect(ports.openSignIn).toHaveBeenCalled();
  });

  it('never destroys the dictation it is asking to unlock', async () => {
    const { repository, store } = createRepository([
      buildCapture({ lastErrorCode: 'unauthorized' }),
    ]);
    const ports = createPorts(repository);

    await runCaptureAction(captureId, 'reconnect', ports);

    expect(ports.deleted).toEqual([]);
    expect(store.get(captureId)?.status).toBe('needs_action');
    expect(repository.remove).not.toHaveBeenCalled();
  });
});

describe('redo', () => {
  it('drops the capture and its audio', async () => {
    const { repository, store } = createRepository([
      buildCapture({ lastErrorCode: 'local_file_missing' }),
    ]);
    const ports = createPorts(repository);

    await runCaptureAction(captureId, 'redo', ports);

    expect(store.has(captureId)).toBe(false);
    expect(ports.deleted).toEqual([
      'file:///documents/captures/capture-1.biume',
    ]);
  });

  it('reopens recording against the same appointment', async () => {
    const { repository } = createRepository([
      buildCapture({ lastErrorCode: 'local_file_missing' }),
    ]);
    const ports = createPorts(repository);

    await runCaptureAction(captureId, 'redo', ports);

    expect(ports.restartRecording).toHaveBeenCalledWith({
      appointmentId: 'appointment-1',
      patientId: null,
    });
  });
});

describe('delete', () => {
  it('cancels locally, tells the server, then removes the audio', async () => {
    const { repository, store } = createRepository([buildCapture()]);
    const ports = createPorts(repository);

    await runCaptureAction(captureId, 'delete', ports);

    expect(store.get(captureId)?.status).toBe('cancelled');
    expect(ports.api.cancelCapture).toHaveBeenCalledWith(captureId);
    expect(ports.deleted).toEqual([
      'file:///documents/captures/capture-1.biume',
    ]);
  });

  it('keeps the capture cancelled when the server refuses', async () => {
    const { repository, store } = createRepository([buildCapture()]);
    const ports = createPorts(repository);
    (ports.api.cancelCapture as jest.Mock).mockRejectedValue(
      new Error('offline'),
    );

    await runCaptureAction(captureId, 'delete', ports);

    expect(store.get(captureId)?.status).toBe('cancelled');
  });

  it('leaves an upload in flight untouched', async () => {
    const { repository, store } = createRepository([
      buildCapture({ status: 'uploading' }),
    ]);
    const ports = createPorts(repository);

    await runCaptureAction(captureId, 'delete', ports);

    expect(store.get(captureId)?.status).toBe('uploading');
    expect(ports.deleted).toEqual([]);
  });
});

describe('unknown capture', () => {
  it('ignores an action on a capture that no longer exists', async () => {
    const { repository } = createRepository();
    const ports = createPorts(repository);

    await expect(
      runCaptureAction(captureId, 'delete', ports),
    ).resolves.toBeUndefined();
    expect(ports.api.cancelCapture).not.toHaveBeenCalled();
  });
});

describe('after signing in again', () => {
  it('returns captures blocked on the session to the queue', async () => {
    const { repository, store } = createRepository([
      buildCapture({ lastErrorCode: 'unauthorized' }),
      buildCapture({
        id: 'b1e0b6a2-1c3d-4e5f-8a9b-0c1d2e3f4a5b',
        lastErrorCode: 'active_organization_required',
      }),
    ]);

    const requeued = await requeueAfterSignIn(repository, now);

    expect(requeued).toBe(2);
    expect(store.get(captureId)?.status).toBe('queued');
    expect(store.get(captureId)?.lastErrorCode).toBeNull();
  });

  it('leaves captures blocked for other reasons alone', async () => {
    const { repository, store } = createRepository([
      buildCapture({ lastErrorCode: 'local_file_missing' }),
    ]);

    const requeued = await requeueAfterSignIn(repository, now);

    expect(requeued).toBe(0);
    expect(store.get(captureId)?.status).toBe('needs_action');
  });
});

describe('changing the attachment before validating', () => {
  it('reattaches a dictation still under review', async () => {
    const { repository, store } = createRepository([
      buildCapture({ status: 'review', appointmentId: null }),
    ]);

    const changed = await updateCaptureAttachment(
      captureId,
      { appointmentId: 'appointment-2', patientId: 'patient-2' },
      { repository, now },
    );

    expect(changed).toBe(true);
    expect(store.get(captureId)?.appointmentId).toBe('appointment-2');
    expect(store.get(captureId)?.patientId).toBe('patient-2');
  });

  it('turns an attached dictation back into a free capture', async () => {
    const { repository, store } = createRepository([
      buildCapture({ status: 'review' }),
    ]);

    await updateCaptureAttachment(
      captureId,
      { appointmentId: null, patientId: null },
      { repository, now },
    );

    expect(store.get(captureId)?.appointmentId).toBeNull();
    expect(store.get(captureId)?.patientId).toBeNull();
  });

  it('refuses to reattach a dictation already validated', async () => {
    // Past review the capture may already exist on the server under this
    // identity; its context is no longer the device's to rewrite.
    const { repository, store } = createRepository([
      buildCapture({ status: 'queued' }),
    ]);

    const changed = await updateCaptureAttachment(
      captureId,
      { appointmentId: 'appointment-2', patientId: null },
      { repository, now },
    );

    expect(changed).toBe(false);
    expect(store.get(captureId)?.appointmentId).toBe('appointment-1');
  });

  it('ignores a capture that no longer exists', async () => {
    const { repository } = createRepository();

    await expect(
      updateCaptureAttachment(
        captureId,
        { appointmentId: null, patientId: null },
        { repository, now },
      ),
    ).resolves.toBe(false);
  });
});
