import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@shopify/restyle';
import { useState } from 'react';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** A single selectable option in a {@link NativeSelect}. */
export interface NativeSelectItem {
  /** Visible option text. */
  label: string;
  /** Value reported to `onValueChange` when chosen. */
  value: string;
  /**
   * Whether the option can be picked. Defaults to `true`. Note: React Native's
   * native picker has no per-item disabled state, so a disabled option is only
   * dimmed (via its text colour), not made unselectable — unlike the web build.
   */
  enabled?: boolean;
}

/** Props for {@link NativeSelect}. */
export interface NativeSelectProps {
  /** The options to show, in order. */
  items: NativeSelectItem[];
  /** Currently selected value. */
  selectedValue?: string;
  /** Fires with the chosen value. */
  onValueChange?: (value: string) => void;
  /** Visible label rendered above the control. */
  label?: string;
  /** Error message. When set, the field is marked invalid and the text announced. */
  error?: string;
  /** Placeholder shown as a leading, empty-valued option. */
  placeholder?: string;
  /** Disables the control and applies the disabled palette. */
  disabled?: boolean;
  /** Test handle for queries (applied to the picker). */
  testID?: string;
  /** Accessible label for the picker. */
  accessibilityLabel?: string;
}

/**
 * A hand-drawn wrapper around the platform picker (`@react-native-picker/picker`).
 * Unlike {@link Select} (a fully custom sketch listbox), this keeps the native
 * wheel/dropdown — better on touch devices and for long option lists — and only
 * restyles the closed control with a sketchy box. Every colour, padding, radius
 * and sketch parameter comes from `@ghds/tokens` (`comp.nativeSelect.*`) via the
 * Restyle theme; the stroke reflects error/focus/default state, mirroring the
 * web build's `resolveStroke`.
 */
export function NativeSelect({
  items,
  selectedValue,
  onValueChange,
  label,
  error,
  placeholder,
  disabled = false,
  testID,
  accessibilityLabel,
}: NativeSelectProps) {
  const theme = useTheme<Theme>();
  const [focused, setFocused] = useState(false);
  const hasError = error !== undefined && error !== '';

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.nativeSelectSketch.roughness,
    bowing: theme.nativeSelectSketch.bowing,
    fillStyle: 'solid',
  });

  let strokeColor: string;
  if (hasError) {
    strokeColor = theme.colors.nativeSelectStrokeDanger;
  } else if (focused && !disabled) {
    strokeColor = theme.colors.nativeSelectStrokeFocus;
  } else {
    strokeColor = theme.colors.nativeSelectStrokeDefault;
  }

  const fillColor = disabled
    ? theme.colors.nativeSelectBgDisabled
    : theme.colors.nativeSelectBgDefault;
  const textColor = disabled
    ? theme.colors.nativeSelectTextDisabled
    : theme.colors.nativeSelectTextValue;

  return (
    <Box gap="nativeSelectGap">
      {label !== undefined ? (
        <Text variant="label" color={hasError ? 'nativeSelectTextDanger' : 'nativeSelectTextLabel'}>
          {label}
        </Text>
      ) : null}
      <Box
        onLayout={onLayout}
        paddingHorizontal="nativeSelectHorizontal"
        paddingVertical="nativeSelectVertical"
        borderRadius="nativeSelect"
      >
        <SketchBackground
          drawable={drawable}
          size={size}
          strokeColor={strokeColor}
          fillColor={fillColor}
          strokeWidth={theme.borderWidths.default}
        />
        <Picker
          selectedValue={selectedValue ?? ''}
          enabled={!disabled}
          testID={testID}
          accessibilityLabel={accessibilityLabel ?? label}
          dropdownIconColor={
            disabled ? theme.colors.nativeSelectIconDisabled : theme.colors.nativeSelectIconDefault
          }
          onValueChange={(value) => onValueChange?.(value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ color: textColor }}
        >
          {placeholder !== undefined ? (
            <Picker.Item
              label={placeholder}
              value=""
              color={theme.colors.nativeSelectTextPlaceholder}
            />
          ) : null}
          {items.map((item) => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
              color={item.enabled === false ? theme.colors.nativeSelectTextDisabled : textColor}
            />
          ))}
        </Picker>
      </Box>
      {hasError ? (
        <Text
          variant="caption"
          color="nativeSelectTextDanger"
          accessibilityLiveRegion="assertive"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </Box>
  );
}
