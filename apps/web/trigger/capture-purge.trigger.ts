import { schedules } from "@trigger.dev/sdk/v3";
import {
  capturePurgeBatchSize,
  purgeExpiredCaptures,
  type PurgeResult,
} from "#/server/mobile/capture-purge";

export const capturePurgeTaskId = "mobile-capture-purge";

/** Bounds one execution so a large backlog cannot run past its time budget. */
export const capturePurgeMaxBatches = 50;

export type CapturePurgeRun = {
  batches: number;
  purged: number;
  failed: number;
};

/**
 * Pure orchestration: keep asking for batches until one comes back empty, or
 * until the execution bound is reached.
 *
 * A batch that only produced failures also stops the loop. Retrying the very
 * same keys immediately would hammer an object store that is already refusing
 * them; the next scheduled run is soon enough.
 */
export async function runCapturePurgeBatches(
  runBatch: () => Promise<PurgeResult>,
): Promise<CapturePurgeRun> {
  let batches = 0;
  let purged = 0;
  let failed = 0;

  while (batches < capturePurgeMaxBatches) {
    const result = await runBatch();
    batches += 1;
    purged += result.purged;
    failed += result.failed;

    if (result.purged === 0) break;
  }

  return { batches, purged, failed };
}

export const capturePurgeTask = schedules.task({
  id: capturePurgeTaskId,
  // Hourly: the retention promise is 24 hours, so an hourly sweep keeps the
  // worst-case overshoot small without polling the database constantly.
  cron: "0 * * * *",
  run: async () => {
    const { createCapturePurgeRepository } = await import(
      "#/server/mobile/capture.repository"
    );
    const { getR2AudioObjectStore } = await import(
      "#/server/mobile/r2-audio-object-store.factory"
    );

    const repository = createCapturePurgeRepository();
    const objectStore = getR2AudioObjectStore();

    return runCapturePurgeBatches(() =>
      purgeExpiredCaptures(
        {
          findExpired: (input) => repository.findExpired(input),
          markExpired: (refs, now) => repository.markExpired(refs, now),
          markPurged: (ref, now) => repository.markPurged(ref, now),
          objectStore,
          now: () => new Date(),
        },
        { limit: capturePurgeBatchSize },
      ),
    );
  },
});
