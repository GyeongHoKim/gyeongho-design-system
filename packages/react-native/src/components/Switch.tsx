import { ellipse } from '@ghds/sketch-core';
import { useTheme } from '@shopify/restyle';
import { useMemo, useState } from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Props for {@link Switch}. */
export interface SwitchProps {
  /** Visible, accessible label — required (there is no separate label element on RN). */
  label: string;
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state when uncontrolled. */
  defaultChecked?: boolean;
  /** Fires with the next checked state on toggle. */
  onCheckedChange?: (checked: boolean) => void;
  /** Disables interaction. */
  disabled?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

const CONTAINER_STYLE: ViewStyle = { flexDirection: 'row', alignItems: 'center' };

/**
 * Hand-drawn switch (toggle). The track comes from `@ghds/sketch-core`
 * (rendered with `react-native-svg`); the thumb is a second, smaller ellipse
 * computed directly from `@ghds/sketch-core`, positioned left/right based on
 * checked state. Uses `accessibilityRole="switch"` — the standard RN pattern.
 */
export function Switch({
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  testID,
}: SwitchProps) {
  const theme = useTheme<Theme>();
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);

  const isChecked = checked ?? internalChecked;

  const { onLayout, size, drawable, seed } = useSketch({
    shape: 'rectangle',
    inset: theme.borderWidths.default,
    roughness: theme.switchSketch.roughness,
    bowing: theme.switchSketch.bowing,
    fillStyle: 'solid',
  });

  const thumb = useMemo(() => {
    if (size.width <= 0 || size.height <= 0) {
      return null;
    }
    const thumbSize = theme.iconSizes.sm;
    const inset = theme.spacing.xs;
    const y = (size.height - thumbSize) / 2;
    const x = isChecked ? size.width - thumbSize - inset : inset;
    return ellipse(x, y, thumbSize, thumbSize, {
      roughness: theme.switchSketch.roughness,
      bowing: theme.switchSketch.bowing,
      seed,
      fillStyle: 'solid',
    });
  }, [
    isChecked,
    size,
    seed,
    theme.iconSizes.sm,
    theme.spacing.xs,
    theme.switchSketch.roughness,
    theme.switchSketch.bowing,
  ]);

  const trackColor = disabled
    ? isChecked
      ? theme.colors.switchBgOnDisabled
      : theme.colors.switchBgOffDisabled
    : isChecked
      ? theme.colors.switchBgOnDefault
      : theme.colors.switchBgOffDefault;
  const strokeColor = disabled
    ? theme.colors.switchStrokeDisabled
    : isChecked
      ? theme.colors.switchStrokeChecked
      : theme.colors.switchStrokeDefault;
  const thumbColor = disabled
    ? theme.colors.switchThumbColorDisabled
    : theme.colors.switchThumbColorDefault;

  const handlePress = () => {
    if (disabled) {
      return;
    }
    const next = !isChecked;
    if (checked === undefined) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: isChecked, disabled }}
      // `accessibilityState.checked` has no React Native Web equivalent
      // mapping (unlike `disabled`, which RNW derives `aria-disabled` from) —
      // `aria-checked` must be set directly for the web target.
      aria-checked={isChecked}
      style={CONTAINER_STYLE}
    >
      <Box onLayout={onLayout} width={theme.spacing['2xl']} height={theme.iconSizes.md}>
        <SketchBackground
          drawable={drawable}
          size={size}
          strokeColor={strokeColor}
          fillColor={trackColor}
          strokeWidth={theme.borderWidths.default}
        />
        {thumb && (
          <SketchBackground
            drawable={thumb}
            size={size}
            strokeColor={thumbColor}
            fillColor={thumbColor}
            strokeWidth={theme.borderWidths.default}
          />
        )}
      </Box>
      <Box paddingLeft="xs">
        <Text variant="body" color={disabled ? 'switchTextDisabled' : 'switchTextLabel'}>
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
