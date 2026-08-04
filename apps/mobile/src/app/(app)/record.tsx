import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Placeholder destination for the home screen's capture actions.
 *
 * The recorder, immediate encryption, playback, and validation land in the next
 * slice. This route exists so the navigation wired in `(app)/index.tsx` targets
 * something real rather than a missing screen.
 */
export default function RecordRoute() {
  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Enregistrement
      </Text>
      <Text style={styles.body}>
        L’enregistrement de dictée n’est pas encore disponible dans cette
        version.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '600' },
  body: { fontSize: 15, opacity: 0.8 },
});
