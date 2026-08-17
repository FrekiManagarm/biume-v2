/**
 * The subset of the platform network state this app depends on. Both fields are
 * optional because the platform reports them that way, and an absent field is
 * an unknown, never a "no".
 */
export type NetworkSnapshot = {
  isConnected?: boolean;
  isInternetReachable?: boolean;
};

export type NetworkSubscription = { remove(): void };

export type NetworkAdapter = {
  getState(): Promise<NetworkSnapshot>;
  addListener(
    listener: (state: NetworkSnapshot) => void,
  ): NetworkSubscription;
};

export type NetworkMonitor = {
  /** Synchronous so the sync engine can consult it without awaiting. */
  isOnline(): boolean;
  refresh(): Promise<void>;
  /** Subscribes and returns the unsubscribe function. */
  start(onRestored: () => void): () => void;
};

/**
 * Only an explicit "no" counts as offline. A connection whose reachability the
 * platform cannot determine is treated as usable: the upload itself is the
 * honest test, and being wrong there costs one attempt, whereas being wrong the
 * other way strands the queue silently.
 */
function readOnline(state: NetworkSnapshot): boolean {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

export function createNetworkMonitor(adapter: NetworkAdapter): NetworkMonitor {
  let online = true;

  return {
    isOnline: () => online,

    async refresh() {
      try {
        online = readOnline(await adapter.getState());
      } catch {
        // A failed reading tells us nothing; the last known state stands.
      }
    },

    start(onRestored) {
      const subscription = adapter.addListener((state) => {
        const next = readOnline(state);
        const restored = next && !online;
        online = next;
        // Only the transition matters. Platforms repeat the current state
        // whenever any network detail changes, and each repeat would otherwise
        // kick off a redundant run.
        if (restored) onRestored();
      });

      void this.refresh();

      return () => subscription.remove();
    },
  };
}
