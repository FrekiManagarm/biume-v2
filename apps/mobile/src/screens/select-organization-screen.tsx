import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type SelectOrganizationScreenProps = {
  organizations: Array<{ id: string; name: string }>;
  onSelect(organizationId: string): void | Promise<void>;
  online?: boolean;
};

export function SelectOrganizationScreen({
  organizations,
  onSelect,
  online = true,
}: SelectOrganizationScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Choisissez votre organisation
      </Text>

      {online ? null : (
        <Text style={styles.notice}>
          Reconnectez-vous à Internet pour choisir une organisation.
        </Text>
      )}

      {organizations.length === 0 ? (
        <Text style={styles.notice}>
          Aucune organisation n’est associée à ce compte.
        </Text>
      ) : null}

      <ScrollView contentContainerStyle={styles.list}>
        {organizations.map((organization) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !online }}
            disabled={!online}
            key={organization.id}
            onPress={() => onSelect(organization.id)}
            style={styles.row}
          >
            <Text style={styles.rowLabel}>{organization.name}</Text>
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
  list: { gap: 12 },
  row: {
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  rowLabel: { fontSize: 16, fontWeight: '500' },
});
