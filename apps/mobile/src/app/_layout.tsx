import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { AppState } from 'react-native';
import { AppStateProvider } from '@/app-state/app-state';
import {
  networkMonitor,
  requestSync,
  sweepRetention,
} from '@/app-state/workspace-ports';
import { useIsDark, usePalette } from '@/design';
import { registerBackgroundSync } from '@/sync/background-sync';

/**
 * Turns the lifecycle events synchronization depends on into runs. Correctness
 * rests on these foreground triggers alone; the background task is registered
 * as an opportunistic extra.
 */
function SyncTriggers() {
  useEffect(() => {
    void requestSync('launch');
    registerBackgroundSync(() => requestSync('background'));

    const subscription = AppState.addEventListener('change', (state) => {
      // A device that lost the network while backgrounded reports it here,
      // before the run has to decide whether it can reach the server.
      if (state === 'active') {
        void sweepRetention();
        void networkMonitor.refresh().then(() => requestSync('foreground'));
      }
    });

    const stopWatchingNetwork = networkMonitor.start(() => {
      void requestSync('network');
    });

    return () => {
      subscription.remove();
      stopWatchingNetwork();
    };
  }, []);

  return null;
}

export default function RootLayout() {
  const palette = usePalette();
  const isDark = useIsDark();

  /**
   * The navigator paints the surface between two screens. Left on its defaults
   * it flashes white on every push, which on a dark theme reads as a bug.
   */
  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;

    return {
      ...base,
      colors: {
        ...base.colors,
        background: palette.canvas,
        border: palette.border,
        card: palette.surface,
        notification: palette.danger,
        primary: palette.primary,
        text: palette.ink,
      },
    };
  }, [isDark, palette]);

  return (
    <AppStateProvider>
      <ThemeProvider value={navigationTheme}>
        <SyncTriggers />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: palette.canvas },
            headerShown: false,
          }}
        />
      </ThemeProvider>
    </AppStateProvider>
  );
}
