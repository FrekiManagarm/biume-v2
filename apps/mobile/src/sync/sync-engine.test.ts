import { captureRetentionMs } from '@biume/contracts/capture';
import type { LocalCapture } from '../capture/local-capture';
import type { CaptureRepository } from '../capture/capture-repository';
import type { SyncEnginePorts } from './sync-engine';
import { MobileApiClientError } from '../api/mobile-api-client';
import { UploadError } from './upload-error';
import { createSyncEngine } from './sync-engine';

const captureId = '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70';
const now = new Date('2026-07-19T12:00:00.000Z');
const bytes = new Uint8Array([9, 8, 7]);

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
    attemptCount: 0,
    nextAttemptAt: null,
    lastErrorCode: null,
    createdAt: '2026-07-19T11:00:00.000Z',
    validatedAt: '2026-07-19T11:01:00.000Z',
    expiresAt: new Date(now.getTime() + captureRetentionMs).toISOString(),
    updatedAt: '2026-07-19T11:01:00.000Z',
    ...overrides,
  };
}

function createRepository(seed: LocalCapture[]) {
  const rows = new Map(seed.map((row) => [row.id, row]));

  const repository: CaptureRepository = {
    insertReview: jest.fn(async () => {}),
    transition: jest.fn(async (id, from, patch) => {
      const row = rows.get(id);
      if (!row || !from.includes(row.status)) return false;
      rows.set(id, { ...row, ...patch } as LocalCapture);
      return true;
    }),
    get: jest.fn(async (id) => rows.get(id) ?? null),
    list: jest.fn(async () => Array.from(rows.values())),
    nextEligible: jest.fn(async () => {
      const eligible = Array.from(rows.values())
        .filter((row) => row.status === 'queued')
        .sort(
          (left, right) =>
            new Date(left.createdAt).getTime() -
            new Date(right.createdAt).getTime(),
        );
      return eligible[0] ?? null;
    }),
    markExpired: jest.fn(async () => []),
    remove: jest.fn(async (id) => {
      rows.delete(id);
    }),
  };

  return { repository, rows };
}

const remoteCapture = {
  id: captureId,
  organizationId: 'org-1',
  practitionerId: 'user-1',
  appointmentId: null,
  patientId: null,
  reportId: null,
  durationMs: 120_000,
  mimeType: 'audio/mp4' as const,
  byteSize: 1_048_576,
  sha256: 'a'.repeat(64),
  objectKey: `captures/hash/${captureId}/audio.m4a`,
  objectEtag: null,
  status: 'pending_upload' as const,
  attemptCount: 0,
  lastErrorCode: null,
  createdAt: '2026-07-19T11:00:00.000Z',
  uploadedAt: null,
  expiresAt: '2026-07-20T11:00:00.000Z',
  purgedAt: null,
};

function createPorts(
  seed: LocalCapture[],
  overrides: Partial<SyncEnginePorts> = {},
) {
  const { repository, rows } = createRepository(seed);

  const ports: SyncEnginePorts = {
    repository,
    api: {
      createCapture: jest.fn(async () => remoteCapture),
      createUploadSession: jest.fn(async () => ({
        method: 'PUT' as const,
        url: 'https://bucket.example.com/signed',
        headers: { 'content-type': 'audio/mp4' },
        expiresAt: '2026-07-19T12:10:00.000Z',
      })),
      completeCapture: jest.fn(async () => ({
        ...remoteCapture,
        status: 'uploaded' as const,
        objectEtag: '"etag-1"',
      })),
      cancelCapture: jest.fn(async () => {}),
      getSession: jest.fn(),
      listAppointments: jest.fn(),
      listCaptures: jest.fn(),
    } as never,
    uploader: { put: jest.fn(async () => ({ etag: '"etag-1"' })) } as never,
    openAudio: jest.fn(async () => bytes),
    isOnline: () => true,
    now: () => now,
    random: () => 0,
    ...overrides,
  };

  return { ports, rows, repository };
}

describe('eligibility and ownership', () => {
  it('keeps a queued capture untouched while offline', async () => {
    const { ports, rows } = createPorts([buildCapture()], {
      isOnline: () => false,
    });

    expect(await createSyncEngine(ports).runOnce()).toEqual({
      status: 'offline',
    });
    expect(rows.get(captureId)?.status).toBe('queued');
    expect(rows.get(captureId)?.attemptCount).toBe(0);
  });

  it('claims the oldest eligible capture', async () => {
    const { ports, rows } = createPorts([
      buildCapture({ id: 'newer', createdAt: '2026-07-19T11:30:00.000Z' }),
      buildCapture({ id: 'older', createdAt: '2026-07-19T10:00:00.000Z' }),
    ]);

    const outcome = await createSyncEngine(ports).runOnce();

    expect(outcome).toEqual({ status: 'uploaded', captureId: 'older' });
    expect(rows.get('newer')?.status).toBe('queued');
  });

  it('cannot claim a row another owner already moved to uploading', async () => {
    const { ports } = createPorts([buildCapture({ status: 'uploading' })]);

    expect(await createSyncEngine(ports).runOnce()).toEqual({ status: 'idle' });
  });

  it('never starts a second upload while one is running', async () => {
    const { ports } = createPorts([buildCapture()]);
    const engine = createSyncEngine(ports);

    const [first, second] = await Promise.all([
      engine.runOnce(),
      engine.runOnce(),
    ]);

    expect(ports.uploader.put).toHaveBeenCalledTimes(1);
    expect([first.status, second.status].sort()).toEqual(['idle', 'uploaded']);
  });

  it('has nothing to do on an empty queue', async () => {
    const { ports } = createPorts([]);

    expect(await createSyncEngine(ports).runOnce()).toEqual({ status: 'idle' });
  });
});

describe('the happy path', () => {
  it('uses one identity from creation to confirmation', async () => {
    const { ports } = createPorts([buildCapture()]);

    await createSyncEngine(ports).runOnce();

    expect(ports.api.createCapture).toHaveBeenCalledWith(
      expect.objectContaining({ id: captureId, sha256: 'a'.repeat(64) }),
    );
    expect(ports.api.createUploadSession).toHaveBeenCalledWith(captureId);
    expect(ports.api.completeCapture).toHaveBeenCalledWith(captureId, {
      etag: '"etag-1"',
    });
  });

  it('feeds decrypted bytes straight to the signed PUT', async () => {
    const { ports } = createPorts([buildCapture()]);

    await createSyncEngine(ports).runOnce();

    expect(ports.uploader.put).toHaveBeenCalledWith({
      url: 'https://bucket.example.com/signed',
      headers: { 'content-type': 'audio/mp4' },
      bytes,
    });
  });

  it('marks uploaded only after the server confirms', async () => {
    const order: string[] = [];
    const { ports, rows } = createPorts([buildCapture()]);
    ports.api.completeCapture = jest.fn(async () => {
      order.push('complete');
      return { ...remoteCapture, status: 'uploaded' as const };
    }) as never;
    ports.repository.transition = jest.fn(async (_id, _from, patch) => {
      if (patch.status === 'uploaded') order.push('persist-uploaded');
      const row = rows.get(captureId);
      if (row) rows.set(captureId, { ...row, ...patch } as LocalCapture);
      return true;
    });

    await createSyncEngine(ports).runOnce();

    expect(order).toEqual(['complete', 'persist-uploaded']);
    expect(rows.get(captureId)?.status).toBe('uploaded');
  });
});

describe('recoverable failures', () => {
  it('schedules a backoff after a server error', async () => {
    const { ports, rows } = createPorts([buildCapture()]);
    ports.uploader.put = jest.fn(async () => {
      throw new MobileApiClientError('server_error', true);
    }) as never;

    const outcome = await createSyncEngine(ports).runOnce();

    expect(outcome).toEqual({
      status: 'deferred',
      captureId,
      code: 'server_error',
    });
    const row = rows.get(captureId);
    expect(row?.status).toBe('queued');
    expect(row?.attemptCount).toBe(1);
    expect(row?.nextAttemptAt).toBe(
      new Date(now.getTime() + 500).toISOString(),
    );
  });

  it('renews an expired signed URL and keeps the same capture', async () => {
    const { ports, rows } = createPorts([buildCapture()]);
    ports.uploader.put = jest.fn(async () => {
      throw new UploadError('upload_url_expired', true);
    }) as never;

    await createSyncEngine(ports).runOnce();

    // A lapsed authorization is not a lapsed capture: the row goes back to the
    // queue with the same identity and object, ready for a fresh signature.
    expect(rows.get(captureId)?.status).toBe('queued');
    expect(rows.get(captureId)?.id).toBe(captureId);
    expect(rows.get(captureId)?.lastErrorCode).toBe('upload_url_expired');
  });

  it('caps the backoff at fifteen minutes', async () => {
    const { ports, rows } = createPorts([
      buildCapture({ attemptCount: 3 }),
    ]);
    ports.random = () => 1;
    ports.uploader.put = jest.fn(async () => {
      throw new MobileApiClientError('rate_limited', true);
    }) as never;

    await createSyncEngine(ports).runOnce();

    const nextAttemptAt = new Date(
      rows.get(captureId)?.nextAttemptAt ?? 0,
    ).getTime();
    expect(nextAttemptAt - now.getTime()).toBeLessThanOrEqual(15 * 60 * 1000);
  });

  it('asks for help on the fifth counted failure', async () => {
    const { ports, rows } = createPorts([buildCapture({ attemptCount: 4 })]);
    ports.uploader.put = jest.fn(async () => {
      throw new MobileApiClientError('server_error', true);
    }) as never;

    const outcome = await createSyncEngine(ports).runOnce();

    expect(outcome.status).toBe('needs_action');
    expect(rows.get(captureId)?.status).toBe('needs_action');
  });
});

describe('failures that need the practitioner', () => {
  it('keeps the file when the session expired', async () => {
    const { ports, rows } = createPorts([buildCapture()]);
    ports.api.createCapture = jest.fn(async () => {
      throw new MobileApiClientError('unauthorized', false);
    }) as never;

    const outcome = await createSyncEngine(ports).runOnce();

    expect(outcome).toEqual({
      status: 'needs_action',
      captureId,
      code: 'unauthorized',
    });
    const row = rows.get(captureId);
    expect(row?.status).toBe('needs_action');
    expect(row?.encryptedFileUri).toBe(
      'file:///documents/captures/capture-1.biume',
    );
    expect(row?.attemptCount).toBe(0);
  });

  it('never retries an identity conflict', async () => {
    const { ports, rows } = createPorts([buildCapture()]);
    ports.api.createCapture = jest.fn(async () => {
      throw new MobileApiClientError('conflict', false);
    }) as never;

    await createSyncEngine(ports).runOnce();

    expect(rows.get(captureId)?.status).toBe('needs_action');
    expect(rows.get(captureId)?.nextAttemptAt).toBeNull();
  });

  it('reports a missing local file rather than retrying forever', async () => {
    const { ports, rows } = createPorts([buildCapture()]);
    ports.openAudio = jest.fn(async () => {
      throw new Error('file gone');
    });

    const outcome = await createSyncEngine(ports).runOnce();

    expect(outcome).toEqual({
      status: 'needs_action',
      captureId,
      code: 'local_file_missing',
    });
    expect(rows.get(captureId)?.lastErrorCode).toBe('local_file_missing');
  });
});

describe('cancellation', () => {
  it('cannot complete a capture cancelled during the upload', async () => {
    const { ports, rows } = createPorts([buildCapture()]);
    ports.uploader.put = jest.fn(async () => {
      const row = rows.get(captureId);
      if (row) rows.set(captureId, { ...row, status: 'cancelled' });
      return { etag: '"etag-1"' };
    }) as never;

    const outcome = await createSyncEngine(ports).runOnce();

    expect(ports.api.completeCapture).not.toHaveBeenCalled();
    expect(outcome.status).not.toBe('uploaded');
    expect(rows.get(captureId)?.status).toBe('cancelled');
  });
});

describe('after a restart', () => {
  it('resumes the very row a crash left behind', async () => {
    const { ports, rows } = createPorts([
      buildCapture({ status: 'queued', attemptCount: 2 }),
    ]);

    const outcome = await createSyncEngine(ports).runOnce();

    expect(outcome).toEqual({ status: 'uploaded', captureId });
    expect(rows.get(captureId)?.status).toBe('uploaded');
    expect(rows.get(captureId)?.attemptCount).toBe(2);
  });
});

describe('telemetry', () => {
  it('reports an upload the server confirmed', async () => {
    const emit = jest.fn();
    const { ports } = createPorts([buildCapture()], { telemetry: { emit } });

    await createSyncEngine(ports).runOnce();

    expect(emit).toHaveBeenCalledWith('capture_uploaded', {
      captureId,
      journeyType: 'free_capture',
      durationMs: 120_000,
      byteSize: 1_048_576,
    });
  });

  it('reports a failure as a normalized category', async () => {
    const emit = jest.fn();
    const { ports } = createPorts([buildCapture()], { telemetry: { emit } });
    ports.uploader.put = jest.fn(async () => {
      throw new UploadError('rate_limited', true);
    }) as never;

    await createSyncEngine(ports).runOnce();

    expect(emit).toHaveBeenCalledWith('capture_queued_offline', {
      captureId,
      journeyType: 'free_capture',
      errorCategory: 'upload',
    });
  });

  it('tells an appointment dictation apart from a free one', async () => {
    const emit = jest.fn();
    const { ports } = createPorts(
      [buildCapture({ appointmentId: 'appointment-1' })],
      { telemetry: { emit } },
    );

    await createSyncEngine(ports).runOnce();

    expect(emit).toHaveBeenCalledWith(
      'capture_uploaded',
      expect.objectContaining({ journeyType: 'appointment' }),
    );
  });

  it('reports nothing when there is nothing to do', async () => {
    const emit = jest.fn();
    const { ports } = createPorts([], { telemetry: { emit } });

    await createSyncEngine(ports).runOnce();

    expect(emit).not.toHaveBeenCalled();
  });

  it('runs without a telemetry sink at all', async () => {
    const { ports } = createPorts([buildCapture()]);

    await expect(createSyncEngine(ports).runOnce()).resolves.toEqual({
      status: 'uploaded',
      captureId,
    });
  });
});
