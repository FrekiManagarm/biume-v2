import {
  Text as RNText,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import type { Palette } from './tokens';
import { typography } from './tokens';
import { usePalette } from './use-palette';

export type TextVariant = keyof typeof typography;

export type TextTone =
  | 'ink'
  | 'muted'
  | 'subtle'
  | 'accent'
  | 'primary'
  | 'danger'
  | 'warning'
  | 'onPrimary'
  | 'onDanger';

const tonePalette: Record<TextTone, keyof Palette> = {
  ink: 'ink',
  muted: 'inkMuted',
  subtle: 'inkSubtle',
  accent: 'accent',
  primary: 'primary',
  danger: 'danger',
  warning: 'warning',
  onPrimary: 'onPrimary',
  onDanger: 'onDanger',
};

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  style?: StyleProp<TextStyle>;
};

/**
 * The only text component in the app. Screens pick a role and a tone, never a
 * size and a hex, so the six screens cannot drift apart the way the previous
 * per-screen `StyleSheet` blocks did.
 *
 * Font scaling is deliberately left on: a practitioner who raised the system
 * text size did it for a reason, and every layout here is written to grow.
 */
export function Text({
  variant = 'body',
  tone = 'ink',
  style,
  ...rest
}: TextProps) {
  const palette = usePalette();

  return (
    <RNText
      style={[typography[variant], { color: palette[tonePalette[tone]] }, style]}
      {...rest}
    />
  );
}
