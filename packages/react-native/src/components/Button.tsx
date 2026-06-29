import { useTheme } from '@shopify/restyle';
import { useState } from 'react';
import { type GestureResponderEvent, Pressable, type ViewStyle } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Visual intent of a {@link Button}. */
export type ButtonVariant = 'primary' | 'danger';

/** Props for {@link Button}. */
export interface ButtonProps {
  /** Visible, accessible label. */
  label: string;
  /** Press handler. Ignored while `disabled`. */
  onPress?: (event: GestureResponderEvent) => void;
  /** Visual intent. Defaults to `'primary'`. */
  variant?: ButtonVariant;
  /** Disables interaction and applies the disabled token palette. */
  disabled?: boolean;
  /** Test handle for queries. */
  testID?: string;
  /** Supplementary a11y hint describing the action's outcome. */
  accessibilityHint?: string;
}

const CONTAINER_STYLE: ViewStyle = { alignSelf: 'flex-start' };

/**
 * Hand-drawn button. The sketchy outline + hachure fill come from
 * `@ghds/sketch-core` (rendered with `react-native-svg`); every color, padding,
 * radius and sketch parameter is sourced from `@ghds/tokens` via the Restyle
 * theme. Press feedback swaps to the `hover`/`active` background tokens without
 * regenerating the geometry, so the outline never shimmers.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  testID,
  accessibilityHint,
}: ButtonProps) {
  const theme = useTheme<Theme>();
  const [pressed, setPressed] = useState(false);

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.buttonSketch.roughness,
    bowing: theme.buttonSketch.bowing,
    fillStyle: 'hachure',
    hachureGap: theme.sketch.hachureGap,
    hachureAngle: theme.sketch.hachureAngle,
  });

  let backgroundHex: string;
  let textColorKey: 'buttonTextPrimary' | 'buttonTextDanger' | 'buttonTextDisabled';
  if (disabled) {
    backgroundHex = theme.colors.buttonBgPrimaryDisabled;
    textColorKey = 'buttonTextDisabled';
  } else if (variant === 'danger') {
    backgroundHex = pressed ? theme.colors.buttonBgDangerHover : theme.colors.buttonBgDanger;
    textColorKey = 'buttonTextDanger';
  } else {
    backgroundHex = pressed ? theme.colors.buttonBgPrimaryActive : theme.colors.buttonBgPrimary;
    textColorKey = 'buttonTextPrimary';
  }

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onLayout={onLayout}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={CONTAINER_STYLE}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={backgroundHex}
        fillColor={backgroundHex}
        strokeWidth={theme.borderWidths.default}
      />
      <Box
        paddingHorizontal="buttonHorizontal"
        paddingVertical="buttonVertical"
        backgroundColor="transparent"
      >
        <Text variant="label" color={textColorKey} textAlign="center">
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
