import type { MobileAppointment } from '@biume/contracts/capture';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  Clock,
  GroupedList,
  Notice,
  Screen,
  ScreenHeader,
  SectionHeader,
  SelectRow,
  spacing,
} from '@/design';

import { formatClock } from './record-screen';

export type CaptureAttachmentChoice = {
  appointmentId: string | null;
  patientId: string | null;
};

export type ReviewScreenProps = {
  contextLabel: string | null;
  durationMs: number;
  playing: boolean;
  online?: boolean;
  /** Candidates the dictation may be reattached to; empty hides the control. */
  appointments?: MobileAppointment[];
  attachedAppointmentId?: string | null;
  onChangeAttachment?(attachment: CaptureAttachmentChoice): void;
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
  appointments = [],
  attachedAppointmentId = null,
  onChangeAttachment,
  onTogglePlayback,
  onRedo,
  onValidate,
  onConfirmRedo,
}: ReviewScreenProps) {
  const [pickingAttachment, setPickingAttachment] = useState(false);
  const canReattach = appointments.length > 0 && onChangeAttachment !== undefined;

  async function handleRedo() {
    if (await onConfirmRedo()) onRedo();
  }

  function choose(attachment: CaptureAttachmentChoice) {
    onChangeAttachment?.(attachment);
    setPickingAttachment(false);
  }

  return (
    <Screen centered scroll>
      <ScreenHeader
        align="center"
        badge={<Badge icon="secure" label="Chiffrée sur l’appareil" tone="done" />}
        title={contextLabel ?? 'Dictée libre'}
      />

      <Card style={styles.player}>
        <Clock caption="Durée de la prise" value={formatClock(durationMs)} />
        <Button
          accessibilityHint="Relit la dictée sans la déchiffrer sur le disque"
          icon={playing ? 'pause' : 'play'}
          label={playing ? 'Pause' : 'Écouter'}
          onPress={onTogglePlayback}
          variant="secondary"
        />
      </Card>

      {online ? null : (
        <Notice
          message="Hors ligne : la dictée partira dès le retour du réseau."
          tone="offline"
        />
      )}

      {canReattach ? (
        <View style={styles.attachment}>
          {pickingAttachment ? (
            <>
              <SectionHeader title="Rattacher la dictée à" />
              <GroupedList>
                <SelectRow
                  accessibilityHint="Conserve la dictée sans rendez-vous"
                  icon="mic"
                  onPress={() =>
                    choose({ appointmentId: null, patientId: null })
                  }
                  selected={attachedAppointmentId === null}
                  title="Dictée libre"
                />
                {appointments.map((item) => (
                  <SelectRow
                    accessibilityHint="Rattache la dictée à ce rendez-vous"
                    icon="patient"
                    key={item.id}
                    onPress={() =>
                      choose({
                        appointmentId: item.id,
                        patientId: item.patientId,
                      })
                    }
                    selected={attachedAppointmentId === item.id}
                    title={item.patientName}
                  />
                ))}
              </GroupedList>
            </>
          ) : (
            <Button
              accessibilityHint="Choisit le rendez-vous auquel la dictée sera rattachée"
              icon="calendar"
              label="Modifier le rattachement"
              onPress={() => setPickingAttachment(true)}
              variant="ghost"
            />
          )}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          accessibilityHint="Met la dictée en file d’envoi"
          icon="check"
          label="Valider la dictée"
          onPress={onValidate}
          size="lg"
        />
        <Button
          accessibilityHint="Supprime cette prise et en démarre une nouvelle"
          icon="redo"
          label="Recommencer"
          onPress={() => {
            void handleRedo();
          }}
          variant="ghost"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  player: { alignItems: 'stretch', gap: spacing.lg, paddingVertical: spacing.xl },
  attachment: { gap: spacing.sm },
  actions: { gap: spacing.sm },
});
