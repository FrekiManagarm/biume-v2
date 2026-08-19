import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from './icons';
import { Text, type TextTone } from './text';
import { radius, spacing, type Palette } from './tokens';
import { usePalette } from './use-palette';

export type BadgeTone = 'neutral' | 'done' | 'action' | 'attention' | 'problem';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
};

function badgeColors(
  tone: BadgeTone,
  palette: Palette,
): { background: string; border: string; foreground: string; text: TextTone } {
  switch (tone) {
    case 'done':
      return {
        background: palette.accentSurface,
        border: palette.accentBorder,
        foreground: palette.accent,
        text: 'accent',
      };
    case 'action':
      return {
        background: palette.primarySurface,
        border: palette.primaryBorder,
        foreground: palette.primary,
        text: 'primary',
      };
    case 'attention':
      return {
        background: palette.warningSurface,
        border: palette.warningBorder,
        foreground: palette.warning,
        text: 'warning',
      };
    case 'problem':
      return {
        background: palette.dangerSurface,
        border: palette.dangerBorder,
        foreground: palette.danger,
        text: 'danger',
      };
    case 'neutral':
      return {
        background: palette.surfaceSunken,
        border: palette.border,
        foreground: palette.inkSubtle,
        text: 'subtle',
      };
  }
}

/**
 * States a fact about the thing next to it: the session is secure, this
 * organization is active, this dictation is waiting to be sent. Color is never
 * the only carrier — every badge has a word, and most have an icon.
 */
export function Badge({ label, tone = 'neutral', icon }: BadgeProps) {
  const palette = usePalette();
  const colors = badgeColors(tone, palette);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
    >
      {icon ? <Icon color={colors.foreground} name={icon} size={13} /> : null}
      <Text tone={colors.text} variant="caption">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
