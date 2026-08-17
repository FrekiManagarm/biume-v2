import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from './icons';
import { IconTile } from './surface';
import { Text } from './text';
import { radius, spacing } from './tokens';
import { usePalette } from './use-palette';

export type SelectRowProps = {
  title: string;
  subtitle?: string;
  icon: IconName;
  tone?: 'neutral' | 'accent' | 'primary';
  badge?: ReactNode;
  onPress(): void;
  disabled?: boolean;
  /** This row is the one being opened; others stay untouched. */
  pending?: boolean;
  /**
   * This row is the current choice in a set. Announced as a state rather than
   * folded into the label, so a screen reader says "selected" instead of the
   * name changing under the practitioner.
   */
  selected?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

/**
 * The organization row from the web page: a tile that identifies, a title with
 * its state, a secondary line, and a trailing affordance that says the row
 * opens something.
 *
 * The accessible name is the title alone. The subtitle is context for the eye;
 * repeating it into the name would make VoiceOver read a slug before the
 * practitioner hears which cabinet they are about to open.
 */
export function SelectRow({
  title,
  subtitle,
  icon,
  tone = 'neutral',
  badge,
  onPress,
  disabled = false,
  pending = false,
  selected,
  accessibilityLabel,
  accessibilityHint,
}: SelectRowProps) {
  const palette = usePalette();
  const blocked = disabled || pending;

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{
        busy: pending,
        disabled: blocked,
        ...(selected === undefined ? {} : { selected }),
      }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? palette.surfacePressed : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <IconTile name={icon} tone={tone} />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title} variant="heading">
            {title}
          </Text>
          {badge}
        </View>
        {subtitle ? (
          <Text numberOfLines={1} tone="subtle" variant="caption">
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.trailing,
          {
            borderColor: tone === 'accent' ? palette.accentBorder : palette.border,
          },
        ]}
      >
        {pending ? (
          <ActivityIndicator color={palette.inkSubtle} size="small" />
        ) : (
          <Icon
            color={tone === 'accent' ? palette.accent : palette.inkSubtle}
            name="chevronRight"
            size={18}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 76,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  body: { flex: 1, gap: 2 },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: { flexShrink: 1 },
  trailing: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
