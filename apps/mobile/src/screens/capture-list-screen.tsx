import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

/** Only the two destructive actions ask first. */
const destructiveActions = new Set<CaptureAction>(['delete', 'redo']);

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
    <SafeAreaView style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Mes dictées
      </Text>

      {rows.length === 0 ? (
        <Text style={styles.notice}>Aucune dictée pour le moment.</Text>
      ) : null}

      <ScrollView contentContainerStyle={styles.list}>
        {rows.map((item) => (
          <View
            accessibilityLabel={item.accessibilityLabel}
            accessible
            key={item.id}
            style={styles.row}
          >
            <Text style={styles.rowLabel}>{item.label}</Text>
            {item.expiresInHours === null ? null : (
              <Text style={styles.rowMeta}>
                {`Expire dans ${item.expiresInHours} h`}
              </Text>
            )}
            <View style={styles.actions}>
              {item.actions.map((action) => (
                <Pressable
                  accessibilityRole="button"
                  key={action}
                  onPress={() => {
                    void handle(item.id, action);
                  }}
                  style={styles.action}
                >
                  <Text style={styles.actionLabel}>{actionLabels[action]}</Text>
                </Pressable>
              ))}
            </View>
          </View>
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
  row: { borderRadius: 8, borderWidth: 1, gap: 8, padding: 16 },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  rowMeta: { fontSize: 13, opacity: 0.8 },
  actions: { flexDirection: 'row', gap: 8 },
  action: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  actionLabel: { fontSize: 14, fontWeight: '500' },
});
