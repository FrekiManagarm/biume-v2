import type { Ref } from 'react';
import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { Text } from './text';
import { controlHeight, radius, spacing } from './tokens';
import { usePalette } from './use-palette';

export type FieldProps = Omit<TextInputProps, 'style' | 'accessibilityLabel'> & {
  label: string;
  /** Shown under the field, and read after the label by a screen reader. */
  hint?: string;
  /** Lets a form move focus from one field to the next. */
  ref?: Ref<TextInput>;
};

/**
 * A visible label, always. The floating-placeholder pattern loses the label the
 * moment the practitioner starts typing, which is exactly when a one-handed
 * user in the field needs it.
 */
export function Field({ label, hint, ref, ...rest }: FieldProps) {
  const palette = usePalette();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text tone="muted" variant="caption">
        {label}
      </Text>
      <TextInput
        accessibilityHint={hint}
        accessibilityLabel={label}
        placeholderTextColor={palette.inkSubtle}
        ref={ref}
        selectionColor={palette.primary}
        {...rest}
        onBlur={(event) => {
          setFocused(false);
          rest.onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        style={[
          styles.input,
          {
            backgroundColor: palette.surface,
            borderColor: focused ? palette.focus : palette.border,
            borderWidth: focused ? 2 : 1,
            color: palette.ink,
            // Keeps the text from shifting by a pixel when the ring appears.
            paddingHorizontal: focused ? spacing.lg - 1 : spacing.lg,
          },
        ]}
      />
      {hint ? (
        <Text tone="subtle" variant="caption">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  input: {
    borderRadius: radius.md,
    fontSize: 16,
    lineHeight: 22,
    minHeight: controlHeight.md,
    paddingVertical: spacing.md,
  },
});
