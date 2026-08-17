import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatClock } from './record-screen';

export type ReviewScreenProps = {
  contextLabel: string | null;
  durationMs: number;
  playing: boolean;
  online?: boolean;
  onTogglePlayback(): void;
  onRedo(): void;
  onValidate(): void;
  onConfirmRedo(): Promise<boolean>;
};

/**
 * Validating is a purely local act: it moves the row to `queued` and nothing
 * else. It must therefore stay available in airplane mode, which is why no
 * control here is gated on connectivity.
 */
export function ReviewScreen({
  contextLabel,
  durationMs,
  playing,
  online = true,
  onTogglePlayback,
  onRedo,
  onValidate,
  onConfirmRedo,
}: ReviewScreenProps) {
  async function handleRedo() {
    if (await onConfirmRedo()) onRedo();
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.context}>
        {contextLabel ?? 'Dictée libre'}
      </Text>

      <View style={styles.block}>
        <Text style={styles.duration}>{formatClock(durationMs)}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onTogglePlayback}
          style={styles.button}
        >
          <Text style={styles.buttonLabel}>{playing ? 'Pause' : 'Écouter'}</Text>
        </Pressable>
      </View>

      {online ? null : (
        <Text style={styles.notice}>
          Hors ligne : la dictée partira dès le retour du réseau.
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={onValidate}
        style={styles.primary}
      >
        <Text style={styles.primaryLabel}>Valider la dictée</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void handleRedo();
        }}
        style={styles.button}
      >
        <Text style={styles.buttonLabel}>Recommencer</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, justifyContent: 'center', padding: 24 },
  context: { fontSize: 22, fontWeight: '600', textAlign: 'center' },
  block: { alignItems: 'center', gap: 12 },
  duration: { fontSize: 40, fontVariant: ['tabular-nums'], fontWeight: '300' },
  notice: { opacity: 0.8, textAlign: 'center' },
  primary: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 64,
    padding: 16,
  },
  primaryLabel: { fontSize: 18, fontWeight: '600' },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    padding: 12,
  },
  buttonLabel: { fontSize: 16, fontWeight: '500' },
});
