import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from './text';
import { spacing } from './tokens';
import { useIsDark, usePalette } from './use-palette';

export type ScreenProps = {
  children: ReactNode;
  /** Screens whose content can exceed the viewport once text is scaled up. */
  scroll?: boolean;
  /** Centers a short, self-contained flow — sign-in, recording, review. */
  centered?: boolean;
};

/**
 * Every screen starts here: the slate canvas from the web, laid out inside the
 * safe area so nothing sits under the Dynamic Island or the home indicator.
 */
export function Screen({ children, scroll = false, centered = false }: ScreenProps) {
  const palette = usePalette();
  const isDark = useIsDark();

  const content = (
    <View style={[styles.content, centered && styles.centered]}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: palette.canvas }]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** A badge sits above the title, the way the web page states the session. */
  badge?: ReactNode;
  /** A single secondary control, aligned with the title. */
  trailing?: ReactNode;
  align?: 'start' | 'center';
};

export function ScreenHeader({
  title,
  subtitle,
  badge,
  trailing,
  align = 'start',
}: ScreenHeaderProps) {
  const centered = align === 'center';

  return (
    <View style={[styles.header, centered && styles.headerCentered]}>
      {badge ? <View style={styles.badgeRow}>{badge}</View> : null}
      <View style={styles.titleRow}>
        <Text
          accessibilityRole="header"
          style={[styles.title, centered && styles.textCentered]}
          variant="display"
        >
          {title}
        </Text>
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
      {subtitle ? (
        <Text style={centered ? styles.textCentered : undefined} tone="muted">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

/** Groups a title with the block it introduces, without a decorative eyebrow. */
export function SectionHeader({
  title,
  meta,
}: {
  title: string;
  meta?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="heading">{title}</Text>
      {meta ? (
        <Text tone="subtle" variant="caption">
          {meta}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    gap: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  centered: { justifyContent: 'center' },
  header: { gap: spacing.sm },
  headerCentered: { alignItems: 'center' },
  badgeRow: { flexDirection: 'row' },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  title: { flexShrink: 1 },
  trailing: { paddingTop: spacing.xs },
  textCentered: { textAlign: 'center' },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
});
