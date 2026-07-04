import { useTheme } from '@shopify/restyle';
import { useContext, useState } from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { CheckboxGroupContext } from './CheckboxGroup.js';
import { Icon } from './Icon.js';

/** Props for {@link Checkbox}. */
export interface CheckboxProps {
  /** Visible, accessible label — required (there is no separate label element on RN). */
  label: string;
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state when uncontrolled. */
  defaultChecked?: boolean;
  /** Fires with the next checked state on toggle. */
  onCheckedChange?: (checked: boolean) => void;
  /** Tri-state visual indicator. Does not affect the emitted checked value. */
  indeterminate?: boolean;
  /** Disables interaction. */
  disabled?: boolean;
  /** Identifies this checkbox within a `CheckboxGroup`. Ignored standalone. */
  value?: string;
  /** Test handle for queries. */
  testID?: string;
}

const CONTAINER_STYLE: ViewStyle = { flexDirection: 'row', alignItems: 'center' };

/**
 * Hand-drawn checkbox. The sketchy box comes from `@ghds/sketch-core`
 * (rendered with `react-native-svg`); the check/indeterminate mark reuses the
 * existing `Icon` component rather than inventing new glyph geometry. Works
 * controlled (`checked`/`onCheckedChange`) or uncontrolled (`defaultChecked`).
 * Inside a `CheckboxGroup`, `checked` is derived from the group's own `value`
 * array via `value`.
 */
export function Checkbox({
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  indeterminate = false,
  disabled = false,
  value,
  testID,
}: CheckboxProps) {
  const theme = useTheme<Theme>();
  const group = useContext(CheckboxGroupContext);
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);

  const groupChecked = group && value !== undefined ? group.value.includes(value) : undefined;
  const isChecked = groupChecked ?? checked ?? internalChecked;
  const isDisabled = disabled || group?.disabled === true;

  const { onLayout, size, drawable } = useSketch({
    shape: 'rectangle',
    inset: theme.borderWidths.default,
    roughness: theme.checkboxSketch.roughness,
    bowing: theme.checkboxSketch.bowing,
    fillStyle: 'solid',
  });

  let strokeColor: string;
  let fillColor: string;
  if (isDisabled) {
    strokeColor = theme.colors.checkboxStrokeDisabled;
    fillColor = isChecked
      ? theme.colors.checkboxBgCheckedDisabled
      : theme.colors.checkboxBgUncheckedDisabled;
  } else {
    strokeColor = isChecked
      ? theme.colors.checkboxStrokeChecked
      : theme.colors.checkboxStrokeDefault;
    fillColor = isChecked
      ? theme.colors.checkboxBgCheckedDefault
      : theme.colors.checkboxBgUncheckedDefault;
  }

  const handlePress = () => {
    if (isDisabled) {
      return;
    }
    const next = !isChecked;
    if (group && value !== undefined) {
      const nextValue = next ? [...group.value, value] : group.value.filter((v) => v !== value);
      group.onValueChange(nextValue);
    } else if (checked === undefined) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: indeterminate ? 'mixed' : isChecked, disabled: isDisabled }}
      // `accessibilityState.checked` has no React Native Web equivalent
      // mapping (unlike `disabled`, which RNW derives `aria-disabled` from) —
      // `aria-checked` must be set directly for the web target.
      aria-checked={indeterminate ? 'mixed' : isChecked}
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
          fillColor={fillColor}
          strokeWidth={theme.borderWidths.default}
        />
        {(isChecked || indeterminate) && (
          <Icon
            name={indeterminate ? 'minus' : 'check'}
            size="sm"
            color={theme.colors.checkboxMark}
          />
        )}
      </Box>
      <Box paddingLeft="xs">
        <Text variant="body" color={isDisabled ? 'checkboxTextDisabled' : 'checkboxTextLabel'}>
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
