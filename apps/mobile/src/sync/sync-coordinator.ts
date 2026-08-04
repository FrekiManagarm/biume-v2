import type { SyncOutcome } from './sync-engine';

export type SyncTrigger =
  | 'launch'
  | 'validation'
  | 'network'
  | 'foreground'
  | 'background';

export type SyncCoordinatorPorts = {
  engine: { runOnce(): Promise<SyncOutcome> };
  onOutcome?(outcome: SyncOutcome): void;
};

/**
 * Turns lifecycle events into runs.
 *
 * Correctness never depends on background execution: every trigger here is a
 * foreground event, and the background task registered elsewhere is only an
 * opportunistic extra.
 */
export function createSyncCoordinator(ports: SyncCoordinatorPorts) {
  let running: Promise<void> | null = null;
  /** Collapses any number of triggers arriving mid-run into one rerun. */
  let rerunPending = false;

  async function drain(): Promise<void> {
    for (;;) {
      let outcome: SyncOutcome;
      try {
        outcome = await ports.engine.runOnce();
      } catch {
        // A run that throws must not take the coordinator down with it; the
        // next trigger will try again.
        return;
      }

      ports.onOutcome?.(outcome);

      // Only a completed upload justifies looking for more work immediately.
      // Anything else means waiting: a backoff, a reconnection, or nothing left.
      if (outcome.status !== 'uploaded') return;
    }
  }

  async function loop(): Promise<void> {
    do {
      rerunPending = false;
      await drain();
    } while (rerunPending);
  }

  return {
    request(_trigger: SyncTrigger): Promise<void> {
      if (running) {
        rerunPending = true;
        return running;
      }
      running = loop().finally(() => {
        running = null;
      });
      return running;
    },
  };
}

export type SyncCoordinator = ReturnType<typeof createSyncCoordinator>;
