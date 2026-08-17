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
  const justExpired = await ports.repository.markExpired(
    ports.now().toISOString(),
  );

  // `markExpired` reports only the rows this call transitioned. Startup
  // recovery sweeps the same window, so a row can already be `expired` with its
  // audio still on disk; sweeping every expired row makes the purge independent
  // of who marked what, and of the order the two run in.
  const alreadyExpired = (await ports.repository.list()).filter(
    (capture) => capture.status === 'expired',
  );

  const captures = new Map<string, string>();
  for (const capture of [...justExpired, ...alreadyExpired]) {
    captures.set(capture.id, capture.encryptedFileUri);
  }

  for (const uri of captures.values()) {
    // A file already gone is the desired end state, not a failure.
    await ports.deleteFile(uri).catch(() => undefined);
  }

  return { purged: captures.size };
}
