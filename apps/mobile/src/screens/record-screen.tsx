import { captureMaxDurationMs } from '@biume/contracts/capture';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Card,
  Clock,
  Notice,
  RecordingPulse,
  Screen,
  ScreenHeader,
  spacing,
} from '@/design';

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

/**
 * One screen, one job. The elapsed time is the interface, the stop button is
 * where the thumb already is, and nothing else competes for attention while a
 * practitioner is talking through a session.
 */
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
    <Screen centered scroll>
      <ScreenHeader align="center" title={contextLabel ?? 'Dictée libre'} />

      {microphoneReady ? null : (
        <Card>
          <Notice
            alert
            message="Biume a besoin du microphone. Autorisez-le dans les réglages."
            tone="danger"
          />
          <Button
            icon="secure"
            label="Ouvrir les réglages"
            onPress={onOpenSettings}
            variant="secondary"
          />
        </Card>
      )}

      <View style={styles.stage}>
        {microphoneReady ? (
          <RecordingPulse label="Enregistrement en cours" />
        ) : null}

        <View
          accessibilityLabel={`Enregistrement en cours, reste ${remaining}`}
          accessible
        >
          <Clock caption={`Reste ${remaining}`} value={formatClock(elapsedMs)} />
        </View>
      </View>

      {online ? null : (
        <Notice
          message="Hors ligne : la dictée sera envoyée plus tard."
          tone="offline"
        />
      )}

      <View style={styles.actions}>
        <Button
          accessibilityHint="Termine la prise et ouvre la relecture"
          icon="stop"
          label="Arrêter"
          onPress={onStop}
          size="lg"
        />
        <Button
          accessibilityHint="Supprime cette prise sans la conserver"
          label="Annuler"
          onPress={onCancel}
          variant="ghost"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xl },
  actions: { gap: spacing.sm },
});
