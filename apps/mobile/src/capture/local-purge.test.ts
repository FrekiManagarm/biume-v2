import { captureRetentionMs } from '@biume/contracts/capture';
import type { CaptureRepository } from './capture-repository';
import type { LocalCapture } from './local-capture';
import { purgeExpiredLocalCaptures } from './local-purge';

const now = new Date('2026-07-20T12:00:00.000Z');

function buildCapture(overrides: Partial<LocalCapture> = {}): LocalCapture {
  return {
    id: 'capture-1',
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
    createdAt: '2026-07-19T12:00:00.000Z',
    validatedAt: null,
    expiresAt: new Date(now.getTime() + captureRetentionMs).toISOString(),
    updatedAt: '2026-07-19T12:00:00.000Z',
    ...overrides,
  };
}

function createPorts(expired: LocalCapture[], rows: LocalCapture[] = []) {
  const deleted: string[] = [];
  const repository: CaptureRepository = {
    insertReview: jest.fn(async () => {}),
    transition: jest.fn(async () => true),
    get: jest.fn(async () => null),
    list: jest.fn(async () => rows),
    nextEligible: jest.fn(async () => null),
    markExpired: jest.fn(async () => expired),
    remove: jest.fn(async () => {}),
  };

  return {
    repository,
    deleted,
    deleteFile: jest.fn(async (uri: string) => {
      deleted.push(uri);
    }),
    now: () => now,
  };
}

describe('local purge', () => {
  it('marks metadata expired using the current time', async () => {
    const ports = createPorts([]);

    await purgeExpiredLocalCaptures(ports);

    expect(ports.repository.markExpired).toHaveBeenCalledWith(
      now.toISOString(),
    );
  });

  it('deletes the encrypted file of an expired capture', async () => {
    const ports = createPorts([buildCapture()]);

    const result = await purgeExpiredLocalCaptures(ports);

    expect(ports.deleted).toEqual([
      'file:///documents/captures/capture-1.biume',
    ]);
    expect(result).toEqual({ purged: 1 });
  });

  it('leaves younger captures alone', async () => {
    const ports = createPorts([]);

    await purgeExpiredLocalCaptures(ports);

    expect(ports.deleteFile).not.toHaveBeenCalled();
  });

  it('tolerates a file that has already gone', async () => {
    const ports = createPorts([buildCapture()]);
    ports.deleteFile = jest.fn(async (_uri: string) => {
      throw new Error('missing');
    });

    await expect(purgeExpiredLocalCaptures(ports)).resolves.toEqual({
      purged: 1,
    });
  });

  it('deletes the audio of a capture that was already marked expired', async () => {
    // Startup recovery also sweeps the retention window, so by the time the
    // purge runs the row can already be `expired` and `markExpired` returns
    // nothing. The audio must go regardless of who marked it.
    const ports = createPorts([], [buildCapture({ status: 'expired' })]);

    const result = await purgeExpiredLocalCaptures(ports);

    expect(ports.deleted).toEqual([
      'file:///documents/captures/capture-1.biume',
    ]);
    expect(result).toEqual({ purged: 1 });
  });

  it('deletes the audio of an expired capture only once', async () => {
    const capture = buildCapture();
    const ports = createPorts([capture], [{ ...capture, status: 'expired' }]);

    const result = await purgeExpiredLocalCaptures(ports);

    expect(ports.deleted).toHaveLength(1);
    expect(result).toEqual({ purged: 1 });
  });

  it('never touches the audio of a capture still inside its window', async () => {
    const ports = createPorts([], [buildCapture({ status: 'queued' })]);

    await purgeExpiredLocalCaptures(ports);

    expect(ports.deleteFile).not.toHaveBeenCalled();
  });

  it('keeps the metadata row for technical audit', async () => {
    const ports = createPorts([buildCapture()]);

    await purgeExpiredLocalCaptures(ports);

    expect(ports.repository.remove).not.toHaveBeenCalled();
  });
});
