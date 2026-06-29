import { useTheme } from '@shopify/restyle';
import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Props for {@link Input}. */
export interface InputProps {
  /** Controlled text value. */
  value?: string;
  /** Change handler receiving the new text. */
  onChangeText?: (text: string) => void;
  /** Placeholder shown when empty; also the default a11y label. */
  placeholder?: string;
  /** Disables editing and applies the disabled token palette. */
  disabled?: boolean;
  /** Explicit accessible label (falls back to `placeholder`). */
  accessibilityLabel?: string;
  /** Test handle for queries. */
  testID?: string;
  /** Keyboard variant. */
  keyboardType?: TextInputProps['keyboardType'];
  /** Masks input for passwords. */
  secureTextEntry?: boolean;
}

/**
 * Hand-drawn text field. The sketchy outline comes from `@ghds/sketch-core`;
 * the border color reflects focus/disabled state using `sys.color.border`
 * tokens, and the text/placeholder colors and typography come from the Restyle
 * theme. Focus only swaps the stroke color — the geometry (and seed) stay
 * fixed, so the outline does not redraw.
 */
export function Input({
  value,
  onChangeText,
  placeholder,
  disabled = false,
  accessibilityLabel,
  testID,
  keyboardType,
  secureTextEntry,
}: InputProps) {
  const theme = useTheme<Theme>();
  const [focused, setFocused] = useState(false);

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.sketch.roughness,
    bowing: theme.sketch.bowing,
  });

  let strokeColor: string;
  if (disabled) {
    strokeColor = theme.colors.borderSubtle;
  } else if (focused) {
    strokeColor = theme.colors.borderFocus;
  } else {
    strokeColor = theme.colors.borderDefault;
  }

  return (
    <Box
      onLayout={onLayout}
      backgroundColor="bgSurface"
      borderRadius="sm"
      paddingHorizontal="md"
      paddingVertical="sm"
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={strokeColor}
        strokeWidth={theme.borderWidths.default}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textDisabled}
        editable={!disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        testID={testID}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        accessibilityState={{ disabled }}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={{
          color: disabled ? theme.colors.textDisabled : theme.colors.textPrimary,
          fontFamily: theme.textVariants.body.fontFamily,
          fontSize: theme.textVariants.body.fontSize,
          padding: 0,
        }}
      />
    </Box>
  );
}
