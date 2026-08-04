import { captureRetentionMs } from '@biume/contracts/capture';
import type { CaptureSqliteDatabase } from './capture-repository';
import type { LocalCapture } from './local-capture';
import {
  createSqliteCaptureRepository,
  mobileSchemaVersion,
} from './sqlite-capture-repository';

/**
 * A real SQL engine rather than a stub: migrations, the compare-and-set
 * transition, and the eligibility index are only meaningful if the statements
 * actually execute.
 */
function createDatabase(): CaptureSqliteDatabase & { raw: any } {
  const { DatabaseSync } = require('node:sqlite');
  const raw = new DatabaseSync(':memory:');

  return {
    raw,
    async execAsync(source: string) {
      raw.exec(source);
    },
    async runAsync(source: string, params: unknown[] = []) {
      return raw.prepare(source).run(...(params as never[]));
    },
    async getFirstAsync<T>(source: string, params: unknown[] = []) {
      return (raw.prepare(source).get(...(params as never[])) ?? null) as T | null;
    },
    async getAllAsync<T>(source: string, params: unknown[] = []) {
      return raw.prepare(source).all(...(params as never[])) as T[];
    },
  };
}

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

async function createRepository() {
  const database = createDatabase();
  const repository = await createSqliteCaptureRepository(database);
  return { repository, database };
}

describe('migrations', () => {
  it('records the schema version it applied', async () => {
    const { database } = await createRepository();

    const row = database.raw
      .prepare('SELECT MAX(version) AS version FROM mobile_schema_migrations')
      .get();
    expect(row.version).toBe(mobileSchemaVersion);
  });

  it('is safe to run twice on the same database', async () => {
    const database = createDatabase();
    await createSqliteCaptureRepository(database);
    await createSqliteCaptureRepository(database);

    const rows = database.raw
      .prepare('SELECT COUNT(*) AS count FROM mobile_schema_migrations')
      .get();
    expect(rows.count).toBe(mobileSchemaVersion);
  });

  it('indexes the synchronizer lookup', async () => {
    const { database } = await createRepository();

    const index = database.raw
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'local_captures' AND name = 'local_captures_eligibility_idx'",
      )
      .get();
    expect(index?.name).toBe('local_captures_eligibility_idx');
  });
});

describe('persistence', () => {
  it('stores a reviewed capture and reads it back unchanged', async () => {
    const { repository } = await createRepository();
    const capture = buildCapture();

    await repository.insertReview(capture);

    expect(await repository.get(capture.id)).toEqual(capture);
  });

  it('round-trips every nullable column', async () => {
    const { repository } = await createRepository();
    const capture = buildCapture({
      appointmentId: 'appointment-1',
      patientId: 'pet-1',
      remoteStatus: 'uploading',
      nextAttemptAt: '2026-07-19T10:05:00.000Z',
      lastErrorCode: 'network',
      validatedAt: '2026-07-19T10:01:00.000Z',
      attemptCount: 3,
    });

    await repository.insertReview(capture);

    expect(await repository.get(capture.id)).toEqual(capture);
  });

  it('answers null for an unknown capture', async () => {
    const { repository } = await createRepository();

    expect(await repository.get('missing')).toBeNull();
  });

  it('lists captures newest first', async () => {
    const { repository } = await createRepository();
    await repository.insertReview(
      buildCapture({ id: 'older', createdAt: '2026-07-19T08:00:00.000Z' }),
    );
    await repository.insertReview(
      buildCapture({ id: 'newer', createdAt: '2026-07-19T09:00:00.000Z' }),
    );

    expect((await repository.list()).map((row) => row.id)).toEqual([
      'newer',
      'older',
    ]);
  });

  it('removes a capture', async () => {
    const { repository } = await createRepository();
    const capture = buildCapture();
    await repository.insertReview(capture);

    await repository.remove(capture.id);

    expect(await repository.get(capture.id)).toBeNull();
  });
});

describe('compare-and-set transition', () => {
  it('applies the patch when the stored status matches', async () => {
    const { repository } = await createRepository();
    const capture = buildCapture({ status: 'review' });
    await repository.insertReview(capture);

    const applied = await repository.transition(capture.id, ['review'], {
      status: 'queued',
      validatedAt: now.toISOString(),
    });

    expect(applied).toBe(true);
    expect((await repository.get(capture.id))?.status).toBe('queued');
  });

  it('refuses to move a row whose status is not expected', async () => {
    const { repository } = await createRepository();
    const capture = buildCapture({ status: 'cancelled' });
    await repository.insertReview(capture);

    const applied = await repository.transition(capture.id, ['queued'], {
      status: 'uploading',
    });

    expect(applied).toBe(false);
    expect((await repository.get(capture.id))?.status).toBe('cancelled');
  });

  it('lets exactly one synchronizer take ownership of a queued row', async () => {
    const { repository } = await createRepository();
    const capture = buildCapture({ status: 'queued' });
    await repository.insertReview(capture);

    const first = await repository.transition(capture.id, ['queued'], {
      status: 'uploading',
    });
    const second = await repository.transition(capture.id, ['queued'], {
      status: 'uploading',
    });

    expect([first, second]).toEqual([true, false]);
  });
});

describe('eligibility', () => {
  it('returns the oldest queued capture that is ready', async () => {
    const { repository } = await createRepository();
    await repository.insertReview(
      buildCapture({
        id: 'newer',
        status: 'queued',
        createdAt: '2026-07-19T09:00:00.000Z',
      }),
    );
    await repository.insertReview(
      buildCapture({
        id: 'older',
        status: 'queued',
        createdAt: '2026-07-19T08:00:00.000Z',
      }),
    );

    expect((await repository.nextEligible(now.toISOString()))?.id).toBe(
      'older',
    );
  });

  it('skips a capture still inside its backoff window', async () => {
    const { repository } = await createRepository();
    await repository.insertReview(
      buildCapture({
        status: 'queued',
        nextAttemptAt: '2026-07-19T10:05:00.000Z',
      }),
    );

    expect(await repository.nextEligible(now.toISOString())).toBeNull();
  });

  it('never returns a capture that is not queued', async () => {
    const { repository } = await createRepository();
    await repository.insertReview(buildCapture({ status: 'needs_action' }));

    expect(await repository.nextEligible(now.toISOString())).toBeNull();
  });
});

describe('expiry sweep', () => {
  it('marks and returns the captures past their retention window', async () => {
    const { repository } = await createRepository();
    await repository.insertReview(
      buildCapture({
        id: 'expired',
        status: 'queued',
        expiresAt: '2026-07-19T09:00:00.000Z',
      }),
    );
    await repository.insertReview(buildCapture({ id: 'fresh' }));

    const swept = await repository.markExpired(now.toISOString());

    expect(swept.map((row) => row.id)).toEqual(['expired']);
    expect((await repository.get('expired'))?.status).toBe('expired');
    expect((await repository.get('fresh'))?.status).toBe('review');
  });

  it('leaves an already cancelled capture alone', async () => {
    const { repository } = await createRepository();
    await repository.insertReview(
      buildCapture({
        id: 'cancelled',
        status: 'cancelled',
        expiresAt: '2026-07-19T09:00:00.000Z',
      }),
    );

    expect(await repository.markExpired(now.toISOString())).toEqual([]);
    expect((await repository.get('cancelled'))?.status).toBe('cancelled');
  });
});
