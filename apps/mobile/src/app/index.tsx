import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAppState } from '@/app-state/app-state';
import { usePalette } from '@/design';

/**
 * The only place routing is decided. Each phase maps to exactly one
 * destination, so no screen has to guess whether it may render.
 */
export default function RouteEntry() {
  const { phase } = useAppState();
  const palette = usePalette();

  if (phase === 'loading') {
    return (
      <View style={[styles.container, { backgroundColor: palette.canvas }]}>
        <ActivityIndicator accessibilityLabel="Chargement" color={palette.primary} />
      </View>
    );
  }
  if (phase === 'signed-out') return <Redirect href="/(auth)/sign-in" />;
  if (phase === 'no-organization') {
    return <Redirect href="/(auth)/select-organization" />;
  }
  return <Redirect href="/(app)" />;
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
