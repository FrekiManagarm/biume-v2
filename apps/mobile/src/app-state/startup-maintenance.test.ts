import { captureRetentionMs } from '@biume/contracts/capture';
import type { CaptureRepository } from '../capture/capture-repository';
import type { LocalCapture } from '../capture/local-capture';
import type { RecoveryPorts } from '../capture/recovery';
import {
  runStartupMaintenance,
  type StartupMaintenancePorts,
} from './startup-maintenance';

const now = new Date('2026-07-20T12:00:00.000Z');
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
    createdAt: '2026-07-19T12:00:00.000Z',
    validatedAt: null,
    expiresAt: new Date(now.getTime() + captureRetentionMs).toISOString(),
    updatedAt: '2026-07-19T12:00:00.000Z',
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
    markExpired: jest.fn(async (at: string) => {
      const expired = Array.from(store.values()).filter(
        (row) =>
          new Date(row.expiresAt).getTime() <= new Date(at).getTime() &&
          row.status !== 'expired' &&
          row.status !== 'cancelled',
      );
      for (const row of expired) {
        store.set(row.id, { ...row, status: 'expired' });
      }
      return expired.map((row) => ({ ...row, status: 'expired' as const }));
    }),
    remove: jest.fn(async (id) => {
      store.delete(id);
    }),
  };

  return { repository, store };
}

function createPorts(
  repository: CaptureRepository,
  overrides: Partial<StartupMaintenancePorts> = {},
): StartupMaintenancePorts & { deleted: string[] } {
  const deleted: string[] = [];

  const recovery: RecoveryPorts = {
    listTemporaryRecordings: jest.fn(async () => []),
    temporaryRecordingSize: jest.fn(async () => 1024),
    sealTemporaryRecording: jest.fn(async () => ({
      capture: buildCapture({ status: 'review' }),
    })),
    discardTemporaryRecording: jest.fn(async () => {}),
    encryptedFileExists: jest.fn(async () => true),
    now: () => now,
  };

  return {
    repository,
    recovery,
    deleteFile: jest.fn(async (uri: string) => {
      deleted.push(uri);
    }),
    now: () => now,
    deleted,
    ...overrides,
  };
}

describe('recovering from a crash', () => {
  it('returns an upload interrupted by a crash to the queue', async () => {
    const { repository, store } = createRepository([
      buildCapture({ status: 'uploading' }),
    ]);

    await runStartupMaintenance(createPorts(repository));

    expect(store.get(captureId)?.status).toBe('queued');
    expect(store.get(captureId)?.attemptCount).toBe(2);
  });

  it('salvages a recording the crash left behind', async () => {
    const { repository, store } = createRepository();
    const ports = createPorts(repository);
    (ports.recovery.listTemporaryRecordings as jest.Mock).mockResolvedValue([
      { captureId, uri: 'file:///tmp/recording-1.m4a' },
    ]);

    await runStartupMaintenance(ports);

    expect(store.get(captureId)?.status).toBe('review');
  });
});

describe('enforcing retention', () => {
  it('deletes the audio of a capture past its window', async () => {
    const { repository, store } = createRepository([
      buildCapture({ expiresAt: '2026-07-20T11:00:00.000Z' }),
    ]);
    const ports = createPorts(repository);

    await runStartupMaintenance(ports);

    expect(ports.deleted).toEqual([
      'file:///documents/captures/capture-1.biume',
    ]);
    expect(store.get(captureId)?.status).toBe('expired');
  });

  it('keeps the audio of a capture still inside its window', async () => {
    const { repository } = createRepository([buildCapture()]);
    const ports = createPorts(repository);

    await runStartupMaintenance(ports);

    expect(ports.deleted).toEqual([]);
  });
});

describe('resilience', () => {
  it('still enforces retention when recovery fails', async () => {
    const { repository } = createRepository([
      buildCapture({ expiresAt: '2026-07-20T11:00:00.000Z' }),
    ]);
    const ports = createPorts(repository);
    (ports.recovery.listTemporaryRecordings as jest.Mock).mockRejectedValue(
      new Error('unreadable directory'),
    );

    await runStartupMaintenance(ports);

    expect(ports.deleted).toEqual([
      'file:///documents/captures/capture-1.biume',
    ]);
  });

  it('never fails the launch', async () => {
    const { repository } = createRepository();
    (repository.list as jest.Mock).mockRejectedValue(new Error('db locked'));
    (repository.markExpired as jest.Mock).mockRejectedValue(
      new Error('db locked'),
    );

    // Maintenance runs before routing: throwing here would drop the
    // practitioner back to the sign-in screen over a database hiccup.
    await expect(
      runStartupMaintenance(createPorts(repository)),
    ).resolves.toBeUndefined();
  });
});
