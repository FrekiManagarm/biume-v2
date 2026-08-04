import type { CaptureRepository } from './capture-repository';

export type LocalPurgePorts = {
  repository: CaptureRepository;
  deleteFile(uri: string): Promise<void>;
  now(): Date;
};

/**
 * Enforces the 24-hour retention on the device.
 *
 * The metadata row survives the audio: it is what lets a practitioner see that
 * a dictation expired, and what the technical audit reads. Only the encrypted
 * file goes.
 */
export async function purgeExpiredLocalCaptures(
  ports: LocalPurgePorts,
): Promise<{ purged: number }> {
  const expired = await ports.repository.markExpired(
    ports.now().toISOString(),
  );

  for (const capture of expired) {
    // A file already gone is the desired end state, not a failure.
    await ports.deleteFile(capture.encryptedFileUri).catch(() => undefined);
  }

  return { purged: expired.length };
}
