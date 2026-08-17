import type { MobileAppointment } from '@biume/contracts/capture';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type HomeScreenProps = {
  primary: MobileAppointment | null;
  upcoming: MobileAppointment[];
  onStartCapture(appointmentId: string | null): void;
  online?: boolean;
};

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
}: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Dictée
      </Text>

      {online ? null : (
        <Text style={styles.notice}>
          Hors ligne : agenda en cache. Reconnectez-vous pour l’actualiser.
        </Text>
      )}

      {primary ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onStartCapture(primary.id)}
          style={styles.primary}
        >
          <Text style={styles.primaryLabel}>
            {`Dicter pour ${primary.patientName}`}
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => onStartCapture(null)}
        style={styles.secondary}
      >
        <Text style={styles.secondaryLabel}>Dictée libre</Text>
      </Pressable>

      {primary === null && upcoming.length === 0 ? (
        <Text style={styles.notice}>
          Aucun rendez-vous dans la période affichée.
        </Text>
      ) : null}

      <ScrollView contentContainerStyle={styles.list}>
        {upcoming.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.id}
            onPress={() => onStartCapture(item.id)}
            style={styles.row}
          >
            <Text style={styles.rowLabel}>
              {`Dicter pour ${item.patientName}`}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, padding: 24 },
  title: { fontSize: 24, fontWeight: '600' },
  notice: { opacity: 0.8 },
  primary: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 64,
    padding: 16,
  },
  primaryLabel: { fontSize: 18, fontWeight: '600' },
  secondary: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    padding: 12,
  },
  secondaryLabel: { fontSize: 16, fontWeight: '500' },
  list: { gap: 8 },
  row: {
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  rowLabel: { fontSize: 15 },
});
