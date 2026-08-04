import type { LocalCaptureStatus } from '@biume/contracts/capture';
import type {
  CapturePatch,
  CaptureRepository,
  CaptureSqliteDatabase,
} from './capture-repository';
import type { LocalCapture } from './local-capture';

export const mobileSchemaVersion = 1;

type CaptureRow = {
  id: string;
  appointment_id: string | null;
  patient_id: string | null;
  encrypted_file_uri: string;
  duration_ms: number;
  mime_type: string;
  byte_size: number;
  sha256: string;
  status: string;
  remote_status: string | null;
  attempt_count: number;
  next_attempt_at: string | null;
  last_error_code: string | null;
  created_at: string;
  validated_at: string | null;
  expires_at: string;
  updated_at: string;
};

const migrations: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS local_captures (
    id TEXT PRIMARY KEY NOT NULL,
    appointment_id TEXT,
    patient_id TEXT,
    encrypted_file_uri TEXT NOT NULL,
    duration_ms INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    byte_size INTEGER NOT NULL,
    sha256 TEXT NOT NULL,
    status TEXT NOT NULL,
    remote_status TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TEXT,
    last_error_code TEXT,
    created_at TEXT NOT NULL,
    validated_at TEXT,
    expires_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS local_captures_eligibility_idx
    ON local_captures (status, next_attempt_at, created_at);`,
];

const columns = [
  'id',
  'appointment_id',
  'patient_id',
  'encrypted_file_uri',
  'duration_ms',
  'mime_type',
  'byte_size',
  'sha256',
  'status',
  'remote_status',
  'attempt_count',
  'next_attempt_at',
  'last_error_code',
  'created_at',
  'validated_at',
  'expires_at',
  'updated_at',
] as const;

const columnByField: Record<keyof LocalCapture, string> = {
  id: 'id',
  appointmentId: 'appointment_id',
  patientId: 'patient_id',
  encryptedFileUri: 'encrypted_file_uri',
  durationMs: 'duration_ms',
  mimeType: 'mime_type',
  byteSize: 'byte_size',
  sha256: 'sha256',
  status: 'status',
  remoteStatus: 'remote_status',
  attemptCount: 'attempt_count',
  nextAttemptAt: 'next_attempt_at',
  lastErrorCode: 'last_error_code',
  createdAt: 'created_at',
  validatedAt: 'validated_at',
  expiresAt: 'expires_at',
  updatedAt: 'updated_at',
};

function toLocalCapture(row: CaptureRow): LocalCapture {
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    patientId: row.patient_id,
    encryptedFileUri: row.encrypted_file_uri,
    durationMs: row.duration_ms,
    mimeType: row.mime_type as LocalCapture['mimeType'],
    byteSize: row.byte_size,
    sha256: row.sha256,
    status: row.status as LocalCaptureStatus,
    remoteStatus: row.remote_status as LocalCapture['remoteStatus'],
    attemptCount: row.attempt_count,
    nextAttemptAt: row.next_attempt_at,
    lastErrorCode: row.last_error_code as LocalCapture['lastErrorCode'],
    createdAt: row.created_at,
    validatedAt: row.validated_at,
    expiresAt: row.expires_at,
    updatedAt: row.updated_at,
  };
}

async function migrate(database: CaptureSqliteDatabase): Promise<void> {
  await database.execAsync(
    `CREATE TABLE IF NOT EXISTS mobile_schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );`,
  );

  const applied = await database.getFirstAsync<{ version: number | null }>(
    'SELECT MAX(version) AS version FROM mobile_schema_migrations',
  );
  const current = applied?.version ?? 0;

  for (let version = current + 1; version <= migrations.length; version += 1) {
    await database.execAsync(migrations[version - 1]!);
    await database.runAsync(
      'INSERT INTO mobile_schema_migrations (version, applied_at) VALUES (?, ?)',
      [version, new Date().toISOString()],
    );
  }
}

export async function createSqliteCaptureRepository(
  database: CaptureSqliteDatabase,
): Promise<CaptureRepository> {
  await migrate(database);

  const selectAll = `SELECT ${columns.join(', ')} FROM local_captures`;

  return {
    async insertReview(capture) {
      await database.runAsync(
        `INSERT INTO local_captures (${columns.join(', ')})
         VALUES (${columns.map(() => '?').join(', ')})`,
        [
          capture.id,
          capture.appointmentId,
          capture.patientId,
          capture.encryptedFileUri,
          capture.durationMs,
          capture.mimeType,
          capture.byteSize,
          capture.sha256,
          capture.status,
          capture.remoteStatus,
          capture.attemptCount,
          capture.nextAttemptAt,
          capture.lastErrorCode,
          capture.createdAt,
          capture.validatedAt,
          capture.expiresAt,
          capture.updatedAt,
        ],
      );
    },

    /**
     * Compare-and-set: the status predicate is part of the UPDATE, so two
     * synchronizers racing for the same row cannot both believe they own it.
     */
    async transition(id, from, patch: CapturePatch) {
      const entries = Object.entries(patch) as [keyof LocalCapture, unknown][];
      if (entries.length === 0) return false;

      const assignments = entries
        .map(([field]) => `${columnByField[field]} = ?`)
        .join(', ');
      const placeholders = from.map(() => '?').join(', ');

      const result = await database.runAsync(
        `UPDATE local_captures SET ${assignments}
         WHERE id = ? AND status IN (${placeholders})`,
        [...entries.map(([, value]) => value ?? null), id, ...from],
      );

      // The affected row count is the only honest answer: re-reading the status
      // afterwards would report success for a row someone else just moved into
      // the very state this call wanted.
      return result.changes > 0;
    },

    async get(id) {
      const row = await database.getFirstAsync<CaptureRow>(
        `${selectAll} WHERE id = ?`,
        [id],
      );
      return row ? toLocalCapture(row) : null;
    },

    async list() {
      const rows = await database.getAllAsync<CaptureRow>(
        `${selectAll} ORDER BY created_at DESC, id DESC`,
      );
      return rows.map(toLocalCapture);
    },

    async nextEligible(now) {
      const row = await database.getFirstAsync<CaptureRow>(
        `${selectAll}
         WHERE status = 'queued' AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
         ORDER BY created_at ASC, id ASC
         LIMIT 1`,
        [now],
      );
      return row ? toLocalCapture(row) : null;
    },

    async markExpired(now) {
      const rows = await database.getAllAsync<CaptureRow>(
        `${selectAll}
         WHERE expires_at <= ? AND status NOT IN ('expired', 'cancelled')`,
        [now],
      );
      if (rows.length === 0) return [];

      await database.runAsync(
        `UPDATE local_captures SET status = 'expired', updated_at = ?
         WHERE expires_at <= ? AND status NOT IN ('expired', 'cancelled')`,
        [now, now],
      );

      return rows.map((row) =>
        toLocalCapture({ ...row, status: 'expired', updated_at: now }),
      );
    },

    async remove(id) {
      await database.runAsync('DELETE FROM local_captures WHERE id = ?', [id]);
    },
  };
}
