import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

import { Text } from './text';
import { clockType, radius, spacing } from './tokens';
import { usePalette } from './use-palette';

export type ClockProps = {
  /** Already formatted as `mm:ss`. */
  value: string;
  /** The line under the clock: remaining time, or the length of a take. */
  caption?: string;
};

/**
 * The elapsed time is the whole interface while recording, so it is set at
 * display size in tabular figures: the digits must not shift sideways once a
 * second, or the practitioner reads a jitter instead of a duration.
 */
export function Clock({ value, caption }: ClockProps) {
  return (
    <View style={styles.clock}>
      <Text style={clockType}>{value}</Text>
      {caption ? (
        <Text tone="subtle" variant="caption">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * The one animation in the app. A recording that looks identical to a paused
 * screen is how a practitioner loses a session, so the dot breathes — unless
 * the system asks for reduced motion, where it stays lit instead.
 */
export function RecordingPulse({ label }: { label: string }) {
  const palette = usePalette();
  const opacity = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!cancelled) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          duration: 700,
          easing: Easing.out(Easing.quad),
          toValue: 0.25,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          duration: 700,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [opacity, reduceMotion]);

  return (
    <View style={styles.pulse}>
      <Animated.View
        style={[styles.dot, { backgroundColor: palette.recording, opacity }]}
      />
      <Text tone="muted" variant="caption">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  clock: { alignItems: 'center', gap: spacing.xs },
  pulse: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: { borderRadius: radius.pill, height: 10, width: 10 },
});
