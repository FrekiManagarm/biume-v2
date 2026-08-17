import type { MobileAppointment } from '@biume/contracts/capture';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  GroupedList,
  IconTile,
  Notice,
  Screen,
  ScreenHeader,
  SectionHeader,
  SelectRow,
  Text,
  spacing,
} from '@/design';

export type HomeScreenProps = {
  primary: MobileAppointment | null;
  upcoming: MobileAppointment[];
  onStartCapture(appointmentId: string | null): void;
  online?: boolean;
  /** Optional: the route wires the queue of dictations still to be sent. */
  onOpenCaptures?(): void;
};

function formatHour(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Recording is the one action that must never depend on the network, so the
 * free-dictation button and every appointment button stay enabled offline. Only
 * the agenda's freshness is qualified.
 */
export function HomeScreen({
  primary,
  upcoming,
  onStartCapture,
  online = true,
  onOpenCaptures,
}: HomeScreenProps) {
  return (
    <Screen>
      <ScreenHeader
        subtitle="Ouvrez un rendez-vous, ou dictez sans en rattacher un."
        title="Aujourd’hui"
        trailing={
          onOpenCaptures ? (
            <Button
              accessibilityHint="Affiche les dictées en attente d’envoi"
              icon="upload"
              label="Mes dictées"
              onPress={onOpenCaptures}
              size="sm"
              variant="secondary"
            />
          ) : null
        }
      />

      {online ? null : (
        <Notice
          message="Hors ligne : agenda en cache. Reconnectez-vous pour l’actualiser."
          tone="offline"
        />
      )}

      {primary ? (
        <Card>
          <View style={styles.primaryHead}>
            <IconTile name="patient" size="lg" tone="primary" />
            <View style={styles.primaryIdentity}>
              <Text numberOfLines={1} variant="title">
                {primary.patientName}
              </Text>
              <Text tone="subtle" variant="caption">
                {`Rendez-vous de ${formatHour(primary.beginAt)}`}
              </Text>
            </View>
          </View>
          <Button
            accessibilityHint="Démarre l’enregistrement de la séance"
            icon="mic"
            label={`Dicter pour ${primary.patientName}`}
            onPress={() => onStartCapture(primary.id)}
            size="lg"
          />
        </Card>
      ) : null}

      <Button
        accessibilityHint="Démarre une dictée sans rendez-vous"
        icon="mic"
        label="Dictée libre"
        onPress={() => onStartCapture(null)}
        variant={primary ? 'secondary' : 'primary'}
      />

      {primary === null && upcoming.length === 0 ? (
        <Card variant="dashed">
          <IconTile name="calendar" size="lg" />
          <Text variant="heading">Aucun rendez-vous dans la période affichée.</Text>
          <Text tone="muted" variant="caption">
            Une dictée libre peut être rattachée à un dossier plus tard depuis
            l’application web.
          </Text>
        </Card>
      ) : null}

      {upcoming.length > 0 ? (
        <View style={styles.list}>
          <SectionHeader
            meta={online ? undefined : 'en cache'}
            title="Rendez-vous suivants"
          />
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <GroupedList>
              {upcoming.map((item) => (
                <SelectRow
                  accessibilityHint="Démarre l’enregistrement de la séance"
                  accessibilityLabel={`Dicter pour ${item.patientName}`}
                  badge={
                    item.status === 'CONFIRMED' ? (
                      <Badge label="Confirmé" tone="neutral" />
                    ) : null
                  }
                  icon="patient"
                  key={item.id}
                  onPress={() => onStartCapture(item.id)}
                  subtitle={formatHour(item.beginAt)}
                  title={item.patientName}
                />
              ))}
            </GroupedList>
          </ScrollView>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  primaryHead: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  primaryIdentity: { flex: 1, gap: 2 },
  list: { flex: 1, gap: spacing.md },
  scrollContent: { paddingBottom: spacing.sm },
});
