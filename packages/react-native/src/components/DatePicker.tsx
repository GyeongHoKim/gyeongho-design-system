import { useTheme } from '@shopify/restyle';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Calendar } from './Calendar.js';
import { Icon } from './Icon.js';

/** Props for {@link DatePicker}. */
export interface DatePickerProps {
  /** Visible, accessible label. */
  label: string;
  /** Controlled selected date. */
  value?: Date;
  /** Fires with the chosen date. */
  onChange?: (date: Date) => void;
  /** Shown on the field when no date is chosen. Defaults to `'Select date'`. */
  placeholder?: string;
  /** Earliest selectable date (inclusive). */
  minDate?: Date;
  /** Latest selectable date (inclusive). */
  maxDate?: Date;
  /** Disables the field. */
  disabled?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * A hand-drawn date picker: a field that opens a {@link Calendar} in a `Modal`
 * (the RN portal counterpart to the web popover). Choosing a day sets the value
 * and closes the panel. Colours and sketch parameters come from `@ghds/tokens`
 * (`comp.datePicker.*`) via the Restyle theme.
 */
export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  testID,
}: DatePickerProps) {
  const theme = useTheme<Theme>();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.datePickerSketch.roughness,
    bowing: theme.datePickerSketch.bowing,
  });

  const strokeColor =
    focused && !disabled
      ? theme.colors.datePickerFieldStrokeFocus
      : theme.colors.datePickerFieldStrokeDefault;

  const handleSelect = (date: Date) => {
    onChange?.(date);
    setOpen(false);
  };

  return (
    <Box>
      <Text variant="label" color="textSecondary" paddingBottom="xs">
        {label}
      </Text>
      <Pressable
        onPress={disabled ? undefined : () => setOpen(true)}
        onLayout={onLayout}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled, expanded: open }}
        aria-expanded={open}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          borderRadius="md"
          paddingHorizontal="md"
          paddingVertical="sm"
          backgroundColor="datePickerFieldBg"
        >
          <SketchBackground
            drawable={drawable}
            size={size}
            strokeColor={strokeColor}
            strokeWidth={theme.borderWidths.default}
          />
          <Text
            style={{
              color: value
                ? theme.colors.datePickerText
                : theme.colors.selectTriggerTextPlaceholder,
              fontFamily: theme.textVariants.body.fontFamily,
              fontSize: theme.textVariants.body.fontSize,
            }}
          >
            {value ? formatDate(value) : placeholder}
          </Text>
          <Icon name="calendar" size="sm" color={theme.colors.datePickerFieldStrokeDefault} />
        </Box>
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setOpen(false)}
          accessibilityLabel="Close"
          testID={testID ? `${testID}-scrim` : undefined}
        />
        <Box
          flex={1}
          alignItems="center"
          justifyContent="center"
          padding="lg"
          pointerEvents="box-none"
        >
          <Calendar
            value={value}
            onChange={handleSelect}
            defaultMonth={value}
            minDate={minDate}
            maxDate={maxDate}
            testID={testID ? `${testID}-calendar` : undefined}
          />
        </Box>
      </Modal>
    </Box>
  );
}
