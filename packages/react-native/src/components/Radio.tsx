import { ellipse } from '@ghds/sketch-core';
import { useTheme } from '@shopify/restyle';
import { useContext, useMemo, useState } from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { RadioGroupContext } from './RadioGroup.js';

/** Props for {@link Radio}. */
export interface RadioProps {
  /** Visible, accessible label — required (there is no separate label element on RN). */
  label: string;
  /** This radio's own value — required, since a radio must identify itself within a group. */
  value: string;
  /** Controlled checked state, for standalone use outside a `RadioGroup`. */
  checked?: boolean;
  /** Initial checked state when uncontrolled and standalone. */
  defaultChecked?: boolean;
  /** Fires when this radio becomes checked, for standalone use. */
  onCheckedChange?: (checked: boolean) => void;
  /** Disables interaction. */
  disabled?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

const CONTAINER_STYLE: ViewStyle = { flexDirection: 'row', alignItems: 'center' };
const DOT_INSET_RATIO = 0.25;

/**
 * Hand-drawn radio button. The ring comes from `@ghds/sketch-core` (rendered
 * with `react-native-svg`, `shape: 'ellipse'`); the checked dot is a second,
 * smaller ellipse computed directly from `@ghds/sketch-core`, sharing the
 * ring's measured size and seed. Used standalone (controlled or uncontrolled)
 * or inside a `RadioGroup`, which derives `checked` from its own `value`.
 */
export function Radio({
  label,
  value,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  testID,
}: RadioProps) {
  const theme = useTheme<Theme>();
  const group = useContext(RadioGroupContext);
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);

  const isChecked = group ? group.value === value : (checked ?? internalChecked);
  const isDisabled = disabled || group?.disabled === true;

  const { onLayout, size, drawable, seed } = useSketch({
    shape: 'ellipse',
    inset: theme.borderWidths.default,
    roughness: theme.radioSketch.roughness,
    bowing: theme.radioSketch.bowing,
  });

  const dot = useMemo(() => {
    if (!isChecked || size.width <= 0 || size.height <= 0) {
      return null;
    }
    const inset = Math.min(size.width, size.height) * DOT_INSET_RATIO;
    return ellipse(inset, inset, size.width - inset * 2, size.height - inset * 2, {
      roughness: theme.radioSketch.roughness,
      bowing: theme.radioSketch.bowing,
      seed,
      fillStyle: 'solid',
    });
  }, [isChecked, size, seed, theme.radioSketch.roughness, theme.radioSketch.bowing]);

  const strokeColor = isDisabled
    ? theme.colors.radioStrokeDisabled
    : isChecked
      ? theme.colors.radioStrokeChecked
      : theme.colors.radioStrokeDefault;
  const dotColor = isDisabled ? theme.colors.radioDotDisabled : theme.colors.radioDotDefault;

  const handlePress = () => {
    if (isDisabled || isChecked) {
      return;
    }
    if (group) {
      group.onValueChange(value);
    } else if (checked === undefined) {
      setInternalChecked(true);
    }
    onCheckedChange?.(true);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: isChecked, disabled: isDisabled }}
      // `accessibilityState.checked` has no React Native Web equivalent
      // mapping (unlike `disabled`, which RNW derives `aria-disabled` from) —
      // `aria-checked` must be set directly for the web target.
      aria-checked={isChecked}
      style={CONTAINER_STYLE}
    >
      <Box
        onLayout={onLayout}
        width={theme.iconSizes.md}
        height={theme.iconSizes.md}
        alignItems="center"
        justifyContent="center"
      >
        <SketchBackground
          drawable={drawable}
          size={size}
          strokeColor={strokeColor}
          strokeWidth={theme.borderWidths.default}
        />
        {dot && (
          <SketchBackground
            drawable={dot}
            size={size}
            strokeColor={dotColor}
            fillColor={dotColor}
            strokeWidth={theme.borderWidths.default}
          />
        )}
      </Box>
      <Box paddingLeft="xs">
        <Text variant="body" color={isDisabled ? 'radioTextDisabled' : 'radioTextLabel'}>
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
