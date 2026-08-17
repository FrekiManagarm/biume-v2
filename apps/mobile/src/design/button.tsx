import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from './icons';
import { Text, type TextTone } from './text';
import {
  controlHeight,
  elevation,
  iconSize,
  radius,
  spacing,
  type Palette,
} from './tokens';
import { usePalette } from './use-palette';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = {
  label: string;
  onPress(): void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconPosition?: 'leading' | 'trailing';
  disabled?: boolean;
  /** Shows a spinner and blocks presses; the label stays visible. */
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

type VariantStyle = {
  background: string;
  backgroundPressed: string;
  border: string;
  tone: TextTone;
  foreground: string;
  raised: boolean;
};

function variantStyle(variant: ButtonVariant, palette: Palette): VariantStyle {
  switch (variant) {
    case 'primary':
      return {
        background: palette.primary,
        backgroundPressed: palette.primaryPressed,
        border: 'transparent',
        tone: 'onPrimary',
        foreground: palette.onPrimary,
        raised: true,
      };
    case 'secondary':
      return {
        background: palette.surface,
        backgroundPressed: palette.surfacePressed,
        border: palette.border,
        tone: 'ink',
        foreground: palette.ink,
        raised: false,
      };
    case 'danger':
      return {
        background: palette.dangerSurface,
        backgroundPressed: palette.dangerBorder,
        border: palette.dangerBorder,
        tone: 'danger',
        foreground: palette.danger,
        raised: false,
      };
    case 'ghost':
      return {
        background: 'transparent',
        backgroundPressed: palette.surfacePressed,
        border: 'transparent',
        tone: 'muted',
        foreground: palette.inkMuted,
        raised: false,
      };
  }
}

/**
 * One button vocabulary for the whole app. `primary` is the single action that
 * advances the practitioner on a screen — record, validate, sign in — and it is
 * the only filled control, so there is never a question about where to tap.
 *
 * Disabled state keeps the control readable rather than fading it out of
 * contrast: offline is a common, temporary state here, not an error.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'leading',
  disabled = false,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const palette = usePalette();
  const style = variantStyle(variant, palette);
  const blocked = disabled || loading;

  const glyph = loading ? (
    <ActivityIndicator color={style.foreground} size="small" />
  ) : icon ? (
    <Icon color={style.foreground} name={icon} size={iconSize.md} />
  ) : null;

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: blocked }}
      disabled={blocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? style.backgroundPressed : style.background,
          borderColor: style.border,
          minHeight: controlHeight[size],
          opacity: blocked ? 0.55 : 1,
          paddingHorizontal: size === 'sm' ? spacing.md : spacing.lg,
        },
        style.raised && !blocked ? elevation.raised : null,
      ]}
    >
      {glyph && iconPosition === 'leading' ? (
        <View style={styles.glyph}>{glyph}</View>
      ) : null}
      <Text style={styles.label} tone={style.tone} variant="label">
        {label}
      </Text>
      {glyph && iconPosition === 'trailing' ? (
        <View style={styles.glyph}>{glyph}</View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  glyph: { alignItems: 'center', justifyContent: 'center' },
  label: { flexShrink: 1, textAlign: 'center' },
});
