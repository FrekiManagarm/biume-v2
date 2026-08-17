import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from './icons';
import { Text, type TextTone } from './text';
import { radius, spacing, type Palette } from './tokens';
import { usePalette } from './use-palette';

export type NoticeTone = 'info' | 'offline' | 'danger' | 'accent';

export type NoticeProps = {
  message: string;
  tone?: NoticeTone;
  icon?: IconName;
  /**
   * Announces the notice as soon as it appears. Reserved for what interrupts
   * the practitioner — a failed sign-in, not a known offline state.
   */
  alert?: boolean;
};

function noticeColors(
  tone: NoticeTone,
  palette: Palette,
): { background: string; border: string; foreground: string; text: TextTone; icon: IconName } {
  switch (tone) {
    case 'offline':
      return {
        background: palette.warningSurface,
        border: palette.warningBorder,
        foreground: palette.warning,
        text: 'warning',
        icon: 'offline',
      };
    case 'danger':
      return {
        background: palette.dangerSurface,
        border: palette.dangerBorder,
        foreground: palette.danger,
        text: 'danger',
        icon: 'alert',
      };
    case 'accent':
      return {
        background: palette.accentSurface,
        border: palette.accentBorder,
        foreground: palette.accent,
        text: 'accent',
        icon: 'sent',
      };
    case 'info':
      return {
        background: palette.surfaceSunken,
        border: palette.border,
        foreground: palette.inkSubtle,
        text: 'muted',
        icon: 'alert',
      };
  }
}

/**
 * Explains a state the practitioner cannot act on directly — offline, expired
 * session, refused sign-in — next to the control it affects rather than in a
 * modal. Field work is full of these states; interrupting for each one would
 * make the app unusable in a stable.
 */
export function Notice({ message, tone = 'info', icon, alert = false }: NoticeProps) {
  const palette = usePalette();
  const colors = noticeColors(tone, palette);

  return (
    <View
      // A notice is one statement: the icon and the sentence must be announced
      // together, not as two stops in the reading order.
      accessible
      accessibilityLiveRegion={alert ? 'polite' : 'none'}
      accessibilityRole={alert ? 'alert' : 'text'}
      style={[
        styles.notice,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
    >
      <Icon color={colors.foreground} name={icon ?? colors.icon} size={18} />
      <Text style={styles.message} tone={colors.text} variant="caption">
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    alignItems: 'flex-start',
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  message: { flex: 1 },
});
