import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { AppState, useColorScheme } from 'react-native';
import { AppStateProvider } from '@/app-state/app-state';
import { useWorkspacePorts } from '@/app-state/workspace-ports';
import { registerBackgroundSync } from '@/sync/background-sync';

/**
 * Turns the lifecycle events synchronization depends on into runs. Correctness
 * rests on these foreground triggers alone; the background task is registered
 * as an opportunistic extra.
 */
function SyncTriggers() {
  const ports = useWorkspacePorts();

  useEffect(() => {
    void ports.requestSync('foreground');
    registerBackgroundSync(() => ports.requestSync('foreground'));

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void ports.requestSync('foreground');
    });
    return () => subscription.remove();
  }, [ports]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AppStateProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SyncTriggers />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </AppStateProvider>
  );
}
