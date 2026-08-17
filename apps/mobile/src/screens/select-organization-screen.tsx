import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Badge,
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

export type SelectOrganizationScreenProps = {
  organizations: Array<{ id: string; name: string }>;
  onSelect(organizationId: string): void | Promise<void>;
  online?: boolean;
  /** The organization already active for this session, when there is one. */
  activeOrganizationId?: string | null;
};

/**
 * The web `select-organization` page on a phone: the same grouped list, the
 * same emerald mark on the active space, the same rule that nothing is opened
 * until the practitioner picks.
 */
export function SelectOrganizationScreen({
  organizations,
  onSelect,
  online = true,
  activeOrganizationId = null,
}: SelectOrganizationScreenProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleSelect(organizationId: string) {
    setPendingId(organizationId);
    try {
      await onSelect(organizationId);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Screen>
      <ScreenHeader
        badge={<Badge icon="secure" label="Session sécurisée" tone="accent" />}
        subtitle="Chaque organisation a ses propriétaires, ses rapports et ses réglages."
        title="Choisissez votre organisation"
      />

      {online ? null : (
        <Notice
          message="Reconnectez-vous à Internet pour choisir une organisation."
          tone="offline"
        />
      )}

      {organizations.length === 0 ? (
        <Card variant="dashed">
          <IconTile name="building" size="lg" />
          <Text variant="heading">Aucune organisation n’est associée à ce compte.</Text>
          <Text tone="muted" variant="caption">
            Créez un espace professionnel depuis l’application web, ou demandez
            une invitation à l’administrateur de votre structure.
          </Text>
        </Card>
      ) : (
        <View style={styles.list}>
          <SectionHeader
            meta={`${organizations.length} disponible${organizations.length > 1 ? 's' : ''}`}
            title="Vos espaces"
          />
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <GroupedList>
              {organizations.map((organization) => {
                const active = organization.id === activeOrganizationId;

                return (
                  <SelectRow
                    accessibilityHint="Ouvre l’agenda de cette organisation"
                    badge={
                      active ? (
                        <Badge icon="check" label="Active" tone="accent" />
                      ) : null
                    }
                    // Another row is opening: block the rest rather than let two
                    // organization switches race for the same session.
                    disabled={
                      !online || (pendingId !== null && pendingId !== organization.id)
                    }
                    icon="building"
                    key={organization.id}
                    onPress={() => {
                      void handleSelect(organization.id);
                    }}
                    pending={pendingId === organization.id}
                    title={organization.name}
                    tone={active ? 'accent' : 'neutral'}
                  />
                );
              })}
            </GroupedList>
          </ScrollView>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, gap: spacing.md },
  scrollContent: { paddingBottom: spacing.sm },
});
