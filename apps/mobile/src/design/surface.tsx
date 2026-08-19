import { Children, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from './icons';
import { radius, spacing } from './tokens';
import { usePalette } from './use-palette';

export type CardProps = {
  children: ReactNode;
  /** `dashed` states an absence — an empty list, a missing organization. */
  variant?: 'solid' | 'dashed' | 'accent';
  style?: StyleProp<ViewStyle>;
};

/**
 * A single hairline carries every surface. The web pairs that border with a
 * 70px blur shadow, which at phone density renders as nothing but a raster
 * cost, so it is dropped here rather than approximated.
 */
export function Card({ children, variant = 'solid', style }: CardProps) {
  const palette = usePalette();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            variant === 'accent' ? palette.accentSurface : palette.surface,
          borderColor:
            variant === 'accent'
              ? palette.accentBorder
              : variant === 'dashed'
                ? palette.borderStrong
                : palette.border,
          borderStyle: variant === 'dashed' ? 'dashed' : 'solid',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * The web list is one bordered container whose rows are separated by a divider
 * rather than floated as individual cards. Keeping that shape on mobile also
 * matches the inset grouped list a phone user already knows.
 */
export function GroupedList({ children }: { children: ReactNode }) {
  const palette = usePalette();
  const items = Children.toArray(children);

  return (
    <View
      style={[
        styles.group,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      {items.map((item, index) => (
        // The wrapper only carries a separator; the row inside keeps its own key.
        <View key={`separated-${index}`}>
          {index > 0 ? (
            <View style={[styles.divider, { backgroundColor: palette.border }]} />
          ) : null}
          {item}
        </View>
      ))}
    </View>
  );
}

export type IconTileProps = {
  name: IconName;
  /** `done` marks the active organization; `attention` a capture needing action; `problem` a failure. */
  tone?: 'neutral' | 'done' | 'action' | 'attention' | 'problem';
  size?: 'md' | 'lg';
};

export function IconTile({ name, tone = 'neutral', size = 'md' }: IconTileProps) {
  const palette = usePalette();

  const colors = {
    neutral: {
      background: palette.surfaceSunken,
      border: palette.border,
      foreground: palette.inkMuted,
    },
    done: {
      background: palette.accentSurface,
      border: palette.accentBorder,
      foreground: palette.accent,
    },
    action: {
      background: palette.primarySurface,
      border: palette.primaryBorder,
      foreground: palette.primary,
    },
    attention: {
      background: palette.warningSurface,
      border: palette.warningBorder,
      foreground: palette.warning,
    },
    problem: {
      background: palette.dangerSurface,
      border: palette.dangerBorder,
      foreground: palette.danger,
    },
  }[tone];

  const box = size === 'lg' ? 56 : 48;

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          height: box,
          width: box,
        },
      ]}
    >
      <Icon color={colors.foreground} name={name} size={size === 'lg' ? 24 : 20} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  group: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  // Inset to the text column: 16 padding + 48 tile + 12 gap.
  divider: { height: 1, marginLeft: 76 },
  tile: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
});
