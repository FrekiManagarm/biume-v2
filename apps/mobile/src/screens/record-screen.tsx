import { captureMaxDurationMs } from '@biume/contracts/capture';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type RecordScreenProps = {
  contextLabel: string | null;
  elapsedMs: number;
  microphoneReady: boolean;
  online?: boolean;
  onStop(): void;
  onCancel(): void;
  onOpenSettings(): void;
};

export function formatClock(milliseconds: number): string {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = String(Math.floor(total / 60)).padStart(2, '0');
  const seconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function RecordScreen({
  contextLabel,
  elapsedMs,
  microphoneReady,
  online = true,
  onStop,
  onCancel,
  onOpenSettings,
}: RecordScreenProps) {
  const remaining = formatClock(captureMaxDurationMs - elapsedMs);

  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.context}>
        {contextLabel ?? 'Dictée libre'}
      </Text>

      {microphoneReady ? null : (
        <View style={styles.block}>
          <Text style={styles.notice}>
            Biume a besoin du microphone. Autorisez-le dans les réglages.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onOpenSettings}
            style={styles.button}
          >
            <Text style={styles.buttonLabel}>Ouvrir les réglages</Text>
          </Pressable>
        </View>
      )}

      <View
        accessibilityLabel={`Enregistrement en cours, reste ${remaining}`}
        accessible
        style={styles.block}
      >
        <Text style={styles.elapsed}>{formatClock(elapsedMs)}</Text>
        <Text style={styles.remaining}>{`Reste ${remaining}`}</Text>
      </View>

      {online ? null : (
        <Text style={styles.notice}>
          Hors ligne : la dictée sera envoyée plus tard.
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={onStop}
        style={styles.primary}
      >
        <Text style={styles.primaryLabel}>Arrêter</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onCancel}
        style={styles.button}
      >
        <Text style={styles.buttonLabel}>Annuler</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, justifyContent: 'center', padding: 24 },
  context: { fontSize: 22, fontWeight: '600', textAlign: 'center' },
  block: { alignItems: 'center', gap: 8 },
  elapsed: { fontSize: 48, fontVariant: ['tabular-nums'], fontWeight: '300' },
  remaining: { fontSize: 15, opacity: 0.8 },
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
