import { useTheme } from '@shopify/restyle';
import { type ReactNode, useState } from 'react';
import { type GestureResponderEvent, Pressable, type ViewStyle } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Props for {@link Toggle}. */
export interface ToggleProps {
  /** Visible, accessible label. */
  label: string;
  /** Controlled pressed (on) state. */
  pressed?: boolean;
  /** Initial pressed state when uncontrolled. */
  defaultPressed?: boolean;
  /** Fires with the next pressed state on toggle. */
  onPressedChange?: (pressed: boolean) => void;
  /** Optional leading content (e.g. an icon) rendered before the label. */
  children?: ReactNode;
  /** Disables interaction. */
  disabled?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

const CONTAINER_STYLE: ViewStyle = { alignSelf: 'flex-start' };

/**
 * A hand-drawn two-state toggle button. Uses `accessibilityRole="button"` with
 * `accessibilityState={{ selected }}` — the standard RN pattern for a pressable
 * that stays "on". The sketchy outline comes from `@ghds/sketch-core`; every
 * colour, radius, padding and sketch parameter is a `comp.toggle` token from
 * `@ghds/tokens` via the Restyle theme.
 */
export function Toggle({
  label,
  pressed,
  defaultPressed,
  onPressedChange,
  children,
  disabled = false,
  testID,
}: ToggleProps) {
  const theme = useTheme<Theme>();
  const [internalPressed, setInternalPressed] = useState(defaultPressed ?? false);
  const [held, setHeld] = useState(false);

  const isPressed = pressed ?? internalPressed;

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.toggleSketch.roughness,
    bowing: theme.toggleSketch.bowing,
    fillStyle: 'solid',
  });

  const backgroundHex = isPressed
    ? theme.colors.toggleBgPressed
    : held
      ? theme.colors.toggleBgHover
      : theme.colors.toggleBgDefault;
  const strokeHex = held && !disabled ? theme.colors.toggleFocusRing : theme.colors.toggleStroke;

  const handlePress = (_event: GestureResponderEvent) => {
    if (disabled) {
      return;
    }
    const next = !isPressed;
    if (pressed === undefined) {
      setInternalPressed(next);
    }
    onPressedChange?.(next);
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setHeld(true)}
      onPressOut={() => setHeld(false)}
      onLayout={onLayout}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isPressed, disabled }}
      // `accessibilityState.selected` has no React Native Web mapping — set
      // `aria-pressed` directly so the web target announces the toggle state.
      aria-pressed={isPressed}
      style={CONTAINER_STYLE}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={strokeHex}
        fillColor={backgroundHex}
        strokeWidth={theme.borderWidths.default}
      />
      <Box
        flexDirection="row"
        alignItems="center"
        gap="xs"
        paddingHorizontal="md"
        paddingVertical="sm"
        backgroundColor="transparent"
      >
        {children}
        <Text
          variant="label"
          color={disabled ? 'textDisabled' : isPressed ? 'toggleTextPressed' : 'toggleText'}
        >
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
