import type { AudioObjectStore } from "./audio-object-store";

export const capturePurgeBatchSize = 100;

export type PurgeableCapture = {
  id: string;
  organizationId: string;
  objectKey: string;
};

export type CaptureScopeRef = { id: string; organizationId: string };

export type CapturePurgePorts = {
  findExpired(input: { now: Date; limit: number }): Promise<PurgeableCapture[]>;
  markExpired(refs: CaptureScopeRef[], now: Date): Promise<void>;
  markPurged(ref: CaptureScopeRef, now: Date): Promise<void>;
  objectStore: AudioObjectStore;
  now(): Date;
};

export type PurgeResult = { purged: number; failed: number };

/**
 * Deletes expired audio in bounded batches.
 *
 * The order matters. Rows are marked `expired` before any object is touched, so
 * a crash mid-batch leaves captures that can no longer be completed rather than
 * live rows pointing at deleted audio. `purgedAt` is written only after the
 * object is actually gone: a row without it stays selectable, which is what
 * makes a failed deletion retry the same key instead of losing it.
 */
export async function purgeExpiredCaptures(
  ports: CapturePurgePorts,
  options: { limit: number },
): Promise<PurgeResult> {
  const now = ports.now();
  const limit = Math.min(options.limit, capturePurgeBatchSize);

  const expired = await ports.findExpired({ now, limit });
  if (expired.length === 0) return { purged: 0, failed: 0 };

  await ports.markExpired(
    expired.map((capture) => ({
      id: capture.id,
      organizationId: capture.organizationId,
    })),
    now,
  );

  let purged = 0;
  let failed = 0;

  for (const capture of expired) {
    try {
      await ports.objectStore.delete(capture.objectKey);
      await ports.markPurged(
        { id: capture.id, organizationId: capture.organizationId },
        now,
      );
      purged += 1;
    } catch {
      // The storage message is deliberately dropped; only the count leaves this
      // function, and the row remains eligible for the next run.
      failed += 1;
    }
  }

  return { purged, failed };
}
