import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAppState } from '@/app-state/app-state';

/**
 * The only place routing is decided. Each phase maps to exactly one
 * destination, so no screen has to guess whether it may render.
 */
export default function RouteEntry() {
  const { phase } = useAppState();

  if (phase === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator accessibilityLabel="Chargement" />
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
