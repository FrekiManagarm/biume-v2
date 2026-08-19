import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  GroupedList,
  IconTile,
  Screen,
  ScreenHeader,
  Text,
  spacing,
  type ButtonVariant,
  type IconName,
} from '@/design';

import type {
  CaptureAction,
  CaptureRowView,
} from '../capture/capture-list-view';

export type CaptureListScreenProps = {
  rows: CaptureRowView[];
  onAction(captureId: string, action: CaptureAction): void;
  onConfirm(action: CaptureAction): Promise<boolean>;
};

const actionLabels: Record<CaptureAction, string> = {
  retry: 'Réessayer',
  reconnect: 'Se reconnecter',
  redo: 'Refaire',
  delete: 'Supprimer',
};

const actionStyles: Record<
  CaptureAction,
  { icon: IconName; variant: ButtonVariant }
> = {
  retry: { icon: 'retry', variant: 'primary' },
  reconnect: { icon: 'signIn', variant: 'primary' },
  redo: { icon: 'redo', variant: 'secondary' },
  delete: { icon: 'delete', variant: 'danger' },
};

/**
 * Status is the only thing a row may show. No patient, no animal, no note:
 * this list is read over a shoulder in a waiting room and announced out loud by
 * a screen reader.
 */
const statusStyles: Record<
  string,
  { icon: IconName; tone: 'neutral' | 'done' | 'action' | 'alert' }
> = {
  queued: { icon: 'clock', tone: 'neutral' },
  uploading: { icon: 'upload', tone: 'action' },
  uploaded: { icon: 'sent', tone: 'done' },
  needs_action: { icon: 'warning', tone: 'alert' },
  expired: { icon: 'alert', tone: 'alert' },
};

/** Only the two destructive actions ask first. */
const destructiveActions = new Set<CaptureAction>(['delete', 'redo']);

function formatCreatedAt(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  return `Enregistrée le ${date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  })} à ${date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function CaptureListScreen({
  rows,
  onAction,
  onConfirm,
}: CaptureListScreenProps) {
  async function handle(captureId: string, action: CaptureAction) {
    if (destructiveActions.has(action)) {
      const confirmed = await onConfirm(action);
      if (!confirmed) return;
    }
    onAction(captureId, action);
  }

  return (
    <Screen>
      <ScreenHeader
        subtitle="Une dictée validée part dès qu’une connexion est disponible."
        title="Mes dictées"
      />

      {rows.length === 0 ? (
        <Card variant="dashed">
          <IconTile name="mic" size="lg" />
          <Text variant="heading">Aucune dictée pour le moment.</Text>
          <Text tone="muted" variant="caption">
            Les dictées enregistrées restent chiffrées sur ce téléphone jusqu’à
            leur envoi, puis sont effacées au bout de 24 heures.
          </Text>
        </Card>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <GroupedList>
            {rows.map((item) => {
              const status = statusStyles[item.status] ?? statusStyles.queued;
              const urgent =
                item.expiresInHours !== null && item.expiresInHours <= 6;

              return (
                <View key={item.id} style={styles.row}>
                  {/*
                   * Only the description carries the row label. Wrapping the
                   * actions in it too would collapse them into a single
                   * accessibility element and hide every recovery control.
                   */}
                  <View
                    accessibilityLabel={item.accessibilityLabel}
                    accessible
                    style={styles.description}
                  >
                    <IconTile name={status.icon} tone={status.tone} />
                    <View style={styles.body}>
                      <View style={styles.titleRow}>
                        <Text variant="heading">{item.label}</Text>
                        {item.expiresInHours === null ? null : (
                          <Badge
                            icon="clock"
                            label={`Expire dans ${item.expiresInHours} h`}
                            tone={urgent ? 'attention' : 'neutral'}
                          />
                        )}
                      </View>
                      <Text tone="subtle" variant="caption">
                        {formatCreatedAt(item.createdAt)}
                      </Text>
                    </View>
                  </View>

                  {item.actions.length > 0 ? (
                    <View style={styles.actions}>
                      {item.actions.map((action) => (
                        <Button
                          icon={actionStyles[action].icon}
                          key={action}
                          label={actionLabels[action]}
                          onPress={() => {
                            void handle(item.id, action);
                          }}
                          size="sm"
                          variant={actionStyles[action].variant}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </GroupedList>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.sm },
  row: { gap: spacing.md, padding: spacing.lg },
  description: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  body: { flex: 1, gap: spacing.xs },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
