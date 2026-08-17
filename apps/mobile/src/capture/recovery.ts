import type { CaptureRepository } from './capture-repository';
import type { LocalCapture } from './local-capture';

export type TemporaryRecording = {
  captureId: string;
  uri: string;
};

export type RecoveryPorts = {
  listTemporaryRecordings(): Promise<TemporaryRecording[]>;
  /** `null` means the file could not be inspected at all. */
  temporaryRecordingSize(recording: TemporaryRecording): Promise<number | null>;
  sealTemporaryRecording(
    recording: TemporaryRecording,
  ): Promise<{ capture: LocalCapture }>;
  discardTemporaryRecording(recording: TemporaryRecording): Promise<void>;
  encryptedFileExists(capture: LocalCapture): Promise<boolean>;
  now(): Date;
};

/**
 * Statuses whose row still depends on a local encrypted file. `uploaded`,
 * `cancelled`, and `expired` no longer do, so a missing file there is expected
 * rather than a problem to report.
 */
const statusesNeedingLocalFile = new Set<LocalCapture['status']>([
  'review',
  'queued',
  'uploading',
  'needs_action',
]);

/**
 * Runs once at startup, before any screen reads the queue.
 *
 * The guiding rule is that a crash must never cost a dictation and must never
 * cost an attempt: interrupted uploads go back to the queue untouched, and only
 * genuinely unusable temporary files are deleted.
 */
export async function recoverCaptureState(
  repository: CaptureRepository,
  ports: RecoveryPorts,
): Promise<void> {
  const now = ports.now().toISOString();

  for (const recording of await ports.listTemporaryRecordings()) {
    const size = await ports.temporaryRecordingSize(recording);
    if (size === null || size === 0) {
      await ports.discardTemporaryRecording(recording);
      continue;
    }

    try {
      const { capture } = await ports.sealTemporaryRecording(recording);
      await repository.insertReview(capture);
    } catch {
      // An undecodable leftover is worth nothing and cannot be salvaged.
      await ports.discardTemporaryRecording(recording);
    }
  }

  for (const capture of await repository.list()) {
    if (capture.status === 'uploading') {
      // A crash is not a failure of the upload: the attempt counter and the
      // last error stay exactly as they were.
      await repository.transition(capture.id, ['uploading'], {
        status: 'queued',
        updatedAt: now,
      });
      continue;
    }

    if (
      statusesNeedingLocalFile.has(capture.status) &&
      !(await ports.encryptedFileExists(capture))
    ) {
      await repository.transition(
        capture.id,
        ['review', 'queued', 'needs_action'],
        {
          status: 'needs_action',
          lastErrorCode: 'local_file_missing',
          nextAttemptAt: null,
          updatedAt: now,
        },
      );
    }
  }

  await repository.markExpired(now);
}
