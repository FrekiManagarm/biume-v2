import * as Network from 'expo-network';
import type { NetworkAdapter } from './network-monitor';

/**
 * Binds the network monitor to Expo. Everything above depends on
 * `NetworkAdapter`, never on `expo-network` directly.
 */
export function createExpoNetworkAdapter(): NetworkAdapter {
  return {
    async getState() {
      const state = await Network.getNetworkStateAsync();
      return {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      };
    },
    addListener(listener) {
      return Network.addNetworkStateListener((event) =>
        listener({
          isConnected: event.isConnected,
          isInternetReachable: event.isInternetReachable,
        }),
      );
    },
  };
}
