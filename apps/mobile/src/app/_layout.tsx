import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
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

// Le splash reste à l'écran tant que la police n'est pas prête : un premier
// rendu en police système suivi d'un basculement vers Hanken Grotesk décale
// toutes les mesures de texte et fait sauter la mise en page sous les yeux du
// praticien. Doit être appelé au chargement du module, avant tout rendu.
void SplashScreen.preventAutoHideAsync();

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

  // Le nom de clé fait la jonction avec `fontFamily` dans design/tokens.ts :
  // deux applications aux mêmes couleurs mais à deux voix ne sont pas la même
  // application. Chargée une seule fois, la police variable porte toutes les
  // graisses utilisées par les tokens (Thin à Black).
  const [fontsLoaded, fontError] = useFonts({
    HankenGrotesk: require('../../assets/fonts/HankenGrotesk-Variable.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

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

  // Rien ne se rend avant que la police ne soit prête (ou en échec) : le
  // splash reste visible à la place d'un premier passage en police système.
  if (!fontsLoaded && !fontError) {
    return null;
  }

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
