import type { SyncOutcome } from './sync-engine';
import { createSyncCoordinator } from './sync-coordinator';

function createEngine(outcomes: SyncOutcome[]) {
  const queue = [...outcomes];
  const runOnce = jest.fn(async () => queue.shift() ?? { status: 'idle' as const });
  return { engine: { runOnce }, runOnce };
}

describe('sync coordinator', () => {
  it('runs once when something asks it to', async () => {
    const { engine, runOnce } = createEngine([{ status: 'idle' }]);
    const coordinator = createSyncCoordinator({ engine });

    await coordinator.request('validation');

    expect(runOnce).toHaveBeenCalledTimes(1);
  });

  it('keeps draining while captures remain', async () => {
    const { engine, runOnce } = createEngine([
      { status: 'uploaded', captureId: 'a' },
      { status: 'uploaded', captureId: 'b' },
      { status: 'idle' },
    ]);
    const coordinator = createSyncCoordinator({ engine });

    await coordinator.request('launch');

    expect(runOnce).toHaveBeenCalledTimes(3);
  });

  it('stops as soon as the device is offline', async () => {
    const { engine, runOnce } = createEngine([{ status: 'offline' }]);
    const coordinator = createSyncCoordinator({ engine });

    await coordinator.request('network');

    expect(runOnce).toHaveBeenCalledTimes(1);
  });

  it('stops after a deferred capture rather than spinning on its backoff', async () => {
    const { engine, runOnce } = createEngine([
      { status: 'deferred', captureId: 'a', code: 'server_error' },
    ]);
    const coordinator = createSyncCoordinator({ engine });

    await coordinator.request('foreground');

    expect(runOnce).toHaveBeenCalledTimes(1);
  });

  it('collapses concurrent requests into a single rerun', async () => {
    // Held in an object so assigning from inside the executor does not narrow
    // the binding to `never`.
    const held: { release: (() => void) | null } = { release: null };
    // Only the first run is held open; every later run settles immediately, so
    // the loop can finish once the triggers have been collapsed.
    const runOnce = jest.fn(() => {
      if (held.release) return Promise.resolve<SyncOutcome>({ status: 'idle' });
      return new Promise<SyncOutcome>((resolve) => {
        held.release = () => resolve({ status: 'idle' });
      });
    });
    const coordinator = createSyncCoordinator({ engine: { runOnce } });

    const first = coordinator.request('validation');
    void coordinator.request('foreground');
    void coordinator.request('network');
    await Promise.resolve();
    held.release?.();
    await first;

    // One in-flight run plus exactly one rerun, however many triggers fired.
    expect(runOnce).toHaveBeenCalledTimes(2);
  });

  it('reports every outcome to the observer', async () => {
    const { engine } = createEngine([
      { status: 'uploaded', captureId: 'a' },
      { status: 'idle' },
    ]);
    const onOutcome = jest.fn();
    const coordinator = createSyncCoordinator({ engine, onOutcome });

    await coordinator.request('launch');

    expect(onOutcome).toHaveBeenCalledWith({
      status: 'uploaded',
      captureId: 'a',
    });
  });

  it('survives an engine that throws', async () => {
    const runOnce = jest.fn(async () => {
      throw new Error('unexpected');
    });
    const coordinator = createSyncCoordinator({ engine: { runOnce } });

    await expect(coordinator.request('launch')).resolves.toBeUndefined();
  });
});
