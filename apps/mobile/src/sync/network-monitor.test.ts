import {
  createNetworkMonitor,
  type NetworkAdapter,
  type NetworkSnapshot,
} from './network-monitor';

function createAdapter(initial: NetworkSnapshot = { isConnected: true }) {
  const listeners = new Set<(state: NetworkSnapshot) => void>();
  let removed = 0;

  const adapter: NetworkAdapter = {
    getState: jest.fn(async () => initial),
    addListener: jest.fn((listener) => {
      listeners.add(listener);
      return {
        remove() {
          listeners.delete(listener);
          removed += 1;
        },
      };
    }),
  };

  return {
    adapter,
    emit(state: NetworkSnapshot) {
      for (const listener of listeners) listener(state);
    },
    get removed() {
      return removed;
    },
  };
}

describe('reading connectivity', () => {
  it('assumes online before the device has answered', () => {
    const { adapter } = createAdapter();

    // Nothing has been read yet: refusing to sync on a guess would strand a
    // validated dictation for no reason.
    expect(createNetworkMonitor(adapter).isOnline()).toBe(true);
  });

  it('reports offline once the device says it is disconnected', async () => {
    const { adapter } = createAdapter({ isConnected: false });
    const monitor = createNetworkMonitor(adapter);

    await monitor.refresh();

    expect(monitor.isOnline()).toBe(false);
  });

  it('reports offline when the connection cannot reach the internet', async () => {
    const { adapter } = createAdapter({
      isConnected: true,
      isInternetReachable: false,
    });
    const monitor = createNetworkMonitor(adapter);

    await monitor.refresh();

    expect(monitor.isOnline()).toBe(false);
  });

  it('stays online when reachability is unknown', async () => {
    const { adapter } = createAdapter({ isConnected: true });
    const monitor = createNetworkMonitor(adapter);

    await monitor.refresh();

    expect(monitor.isOnline()).toBe(true);
  });

  it('keeps the last known state when a reading fails', async () => {
    const { adapter } = createAdapter();
    (adapter.getState as jest.Mock).mockRejectedValueOnce(new Error('no radio'));
    const monitor = createNetworkMonitor(adapter);

    await monitor.refresh();

    expect(monitor.isOnline()).toBe(true);
  });
});

describe('restoration', () => {
  it('signals the return of the network', async () => {
    const network = createAdapter({ isConnected: false });
    const monitor = createNetworkMonitor(network.adapter);
    const onRestored = jest.fn();

    monitor.start(onRestored);
    await monitor.refresh();
    network.emit({ isConnected: true });

    expect(onRestored).toHaveBeenCalledTimes(1);
  });

  it('does not signal a connection that never dropped', async () => {
    const network = createAdapter({ isConnected: true });
    const monitor = createNetworkMonitor(network.adapter);
    const onRestored = jest.fn();

    monitor.start(onRestored);
    await monitor.refresh();
    network.emit({ isConnected: true });
    network.emit({ isConnected: true });

    expect(onRestored).not.toHaveBeenCalled();
  });

  it('signals again after a second drop', async () => {
    const network = createAdapter({ isConnected: true });
    const monitor = createNetworkMonitor(network.adapter);
    const onRestored = jest.fn();

    monitor.start(onRestored);
    await monitor.refresh();
    network.emit({ isConnected: false });
    network.emit({ isConnected: true });
    network.emit({ isConnected: false });
    network.emit({ isConnected: true });

    expect(onRestored).toHaveBeenCalledTimes(2);
  });

  it('stops listening when it is stopped', async () => {
    const network = createAdapter({ isConnected: false });
    const monitor = createNetworkMonitor(network.adapter);
    const onRestored = jest.fn();

    const stop = monitor.start(onRestored);
    await monitor.refresh();
    stop();
    network.emit({ isConnected: true });

    expect(network.removed).toBe(1);
    expect(onRestored).not.toHaveBeenCalled();
  });
});
