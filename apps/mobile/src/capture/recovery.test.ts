import { captureRetentionMs } from '@biume/contracts/capture';
import type { CaptureRepository } from './capture-repository';
import type { LocalCapture } from './local-capture';
import { recoverCaptureState, type RecoveryPorts } from './recovery';

const now = new Date('2026-07-19T10:00:00.000Z');
const captureId = '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70';

function buildCapture(overrides: Partial<LocalCapture> = {}): LocalCapture {
  return {
    id: captureId,
    appointmentId: null,
    patientId: null,
    encryptedFileUri: 'file:///documents/captures/capture-1.biume',
    durationMs: 120_000,
    mimeType: 'audio/mp4',
    byteSize: 1_048_576,
    sha256: 'a'.repeat(64),
    status: 'queued',
    remoteStatus: null,
    attemptCount: 2,
    nextAttemptAt: null,
    lastErrorCode: null,
    createdAt: now.toISOString(),
    validatedAt: null,
    expiresAt: new Date(now.getTime() + captureRetentionMs).toISOString(),
    updatedAt: now.toISOString(),
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

function createPorts(overrides: Partial<RecoveryPorts> = {}): RecoveryPorts {
  return {
    listTemporaryRecordings: jest.fn(async () => []),
    temporaryRecordingSize: jest.fn(async () => 1024),
    sealTemporaryRecording: jest.fn(async (temp) => ({
      capture: buildCapture({
        id: temp.captureId,
        status: 'review',
        attemptCount: 0,
      }),
    })),
    discardTemporaryRecording: jest.fn(async () => {}),
    encryptedFileExists: jest.fn(async () => true),
    now: () => now,
    ...overrides,
  };
}

describe('interrupted recordings', () => {
  it('salvages a non-empty recording into review', async () => {
    const { repository, store } = createRepository();
    const ports = createPorts({
      listTemporaryRecordings: jest.fn(async () => [
        { captureId, uri: 'file:///tmp/capture-1.m4a' },
      ]),
    });

    await recoverCaptureState(repository, ports);

    expect(store.get(captureId)?.status).toBe('review');
    expect(ports.discardTemporaryRecording).not.toHaveBeenCalled();
  });

  it('discards a zero-byte recording', async () => {
    const { repository, store } = createRepository();
    const ports = createPorts({
      listTemporaryRecordings: jest.fn(async () => [
        { captureId, uri: 'file:///tmp/capture-1.m4a' },
      ]),
      temporaryRecordingSize: jest.fn(async () => 0),
    });

    await recoverCaptureState(repository, ports);

    expect(store.size).toBe(0);
    expect(ports.discardTemporaryRecording).toHaveBeenCalledWith({
      captureId,
      uri: 'file:///tmp/capture-1.m4a',
    });
  });

  it('discards a recording it cannot read', async () => {
    const { repository, store } = createRepository();
    const ports = createPorts({
      listTemporaryRecordings: jest.fn(async () => [
        { captureId, uri: 'file:///tmp/capture-1.m4a' },
      ]),
      temporaryRecordingSize: jest.fn(async () => null),
    });

    await recoverCaptureState(repository, ports);

    expect(store.size).toBe(0);
    expect(ports.discardTemporaryRecording).toHaveBeenCalled();
  });

  it('discards a recording whose sealing fails', async () => {
    const { repository, store } = createRepository();
    const ports = createPorts({
      listTemporaryRecordings: jest.fn(async () => [
        { captureId, uri: 'file:///tmp/capture-1.m4a' },
      ]),
      sealTemporaryRecording: jest.fn(async () => {
        throw new Error('undecodable');
      }),
    });

    await recoverCaptureState(repository, ports);

    expect(store.size).toBe(0);
    expect(ports.discardTemporaryRecording).toHaveBeenCalled();
  });
});

describe('stale uploads', () => {
  it('returns an interrupted upload to the queue', async () => {
    const { repository, store } = createRepository([
      buildCapture({ status: 'uploading' }),
    ]);

    await recoverCaptureState(repository, createPorts());

    expect(store.get(captureId)?.status).toBe('queued');
  });

  it('never charges a crash as a failed attempt', async () => {
    const { repository, store } = createRepository([
      buildCapture({ status: 'uploading', attemptCount: 2 }),
    ]);

    await recoverCaptureState(repository, createPorts());

    expect(store.get(captureId)?.attemptCount).toBe(2);
    expect(store.get(captureId)?.lastErrorCode).toBeNull();
  });
});

describe('missing encrypted files', () => {
  it('asks the practitioner to act when the audio is gone', async () => {
    const { repository, store } = createRepository([buildCapture()]);
    const ports = createPorts({
      encryptedFileExists: jest.fn(async () => false),
    });

    await recoverCaptureState(repository, ports);

    expect(store.get(captureId)?.status).toBe('needs_action');
    expect(store.get(captureId)?.lastErrorCode).toBe('local_file_missing');
  });

  it('leaves an already uploaded capture alone when its file is gone', async () => {
    const { repository, store } = createRepository([
      buildCapture({ status: 'uploaded' }),
    ]);
    const ports = createPorts({
      encryptedFileExists: jest.fn(async () => false),
    });

    await recoverCaptureState(repository, ports);

    expect(store.get(captureId)?.status).toBe('uploaded');
  });
});

describe('expired sessions', () => {
  it('keeps the encrypted file of a capture that needs a new session', async () => {
    const { repository, store } = createRepository([
      buildCapture({
        status: 'needs_action',
        lastErrorCode: 'unauthorized',
      }),
    ]);
    const ports = createPorts();

    await recoverCaptureState(repository, ports);

    expect(store.get(captureId)?.encryptedFileUri).toBe(
      'file:///documents/captures/capture-1.biume',
    );
    expect(repository.remove).not.toHaveBeenCalled();
  });
});

describe('retention', () => {
  it('sweeps captures past their window on startup', async () => {
    const { repository } = createRepository([buildCapture()]);

    await recoverCaptureState(repository, createPorts());

    expect(repository.markExpired).toHaveBeenCalledWith(now.toISOString());
  });
});
