import { useTheme } from '@shopify/restyle';
import { useRef, useState } from 'react';
import {
  type NativeSyntheticEvent,
  TextInput,
  type TextInputKeyPressEventData,
} from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Which characters an {@link InputOTP} accepts. */
export type InputOTPMode = 'numeric' | 'text';

/** Props for {@link InputOTP}. */
export interface InputOTPProps {
  /** Number of segments/cells. Defaults to `6`. */
  length?: number;
  /** Controlled value (a left-filled prefix, never longer than `length`). */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Fires on every change with the full current value. */
  onChange?: (value: string) => void;
  /** Fires once the last cell is filled, with the complete code. */
  onComplete?: (value: string) => void;
  /** Accepted characters. `'numeric'` (default) restricts to digits. */
  mode?: InputOTPMode;
  /** Masks the entered characters like a password. */
  mask?: boolean;
  /** Disables every cell and applies the disabled palette. */
  disabled?: boolean;
  /** Marks every cell invalid (danger stroke). */
  invalid?: boolean;
  /** Visible label rendered above the row of cells. */
  label?: string;
  /** Test handle for queries (applied to the cell group). */
  testID?: string;
  /** Accessible name for the group when no visible `label` is provided. */
  accessibilityLabel?: string;
}

function isAllowed(char: string, mode: InputOTPMode): boolean {
  return mode === 'numeric' ? /^[0-9]$/.test(char) : /^\S$/.test(char);
}

function sanitize(raw: string, mode: InputOTPMode): string {
  return Array.from(raw)
    .filter((ch) => isAllowed(ch, mode))
    .join('');
}

interface OtpCellProps {
  char: string;
  active: boolean;
  filled: boolean;
  disabled: boolean;
  invalid: boolean;
  mask: boolean;
  mode: InputOTPMode;
  accessibilityLabel: string;
  testID?: string;
  inputRef: (node: TextInput | null) => void;
  onFocus: () => void;
  onChangeText: (text: string) => void;
  onKeyPress: (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
}

function OtpCell({
  char,
  active,
  filled,
  disabled,
  invalid,
  mask,
  mode,
  accessibilityLabel,
  testID,
  inputRef,
  onFocus,
  onChangeText,
  onKeyPress,
}: OtpCellProps) {
  const theme = useTheme<Theme>();
  const size = theme.inputOtpSize;

  const {
    onLayout,
    size: measured,
    drawable,
  } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.inputOtpSketch.roughness,
    bowing: theme.inputOtpSketch.bowing,
    fillStyle: 'solid',
  });

  let strokeColor: string;
  if (invalid) {
    strokeColor = theme.colors.inputOtpStrokeDanger;
  } else if (active) {
    strokeColor = theme.colors.inputOtpStrokeActive;
  } else {
    strokeColor = filled ? theme.colors.inputOtpStrokeFilled : theme.colors.inputOtpStrokeDefault;
  }

  const fillColor = disabled
    ? theme.colors.inputOtpCellBgDisabled
    : theme.colors.inputOtpCellBgDefault;

  return (
    <Box onLayout={onLayout} width={size} height={size} borderRadius="inputOtp">
      <SketchBackground
        drawable={drawable}
        size={measured}
        strokeColor={strokeColor}
        fillColor={fillColor}
        strokeWidth={theme.borderWidths.default}
      />
      <TextInput
        ref={inputRef}
        editable={!disabled}
        value={char}
        maxLength={1}
        keyboardType={mode === 'numeric' ? 'number-pad' : 'default'}
        secureTextEntry={mask}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        onFocus={onFocus}
        onChangeText={onChangeText}
        onKeyPress={onKeyPress}
        style={{
          width: size,
          height: size,
          padding: 0,
          textAlign: 'center',
          backgroundColor: 'transparent',
          color: disabled ? theme.colors.inputOtpTextDisabled : theme.colors.inputOtpTextValue,
          fontFamily: theme.textVariants.body.fontFamily,
          fontSize: theme.textVariants.title.fontSize,
        }}
      />
    </Box>
  );
}

/**
 * A hand-drawn one-time-code field: a row of single-character cells backed by a
 * left-filled string value. Each cell is its own sketchy box
 * (`@ghds/sketch-core`); the active cell shows the focus stroke, filled cells a
 * stronger stroke, and every colour, size and sketch parameter comes from
 * `@ghds/tokens` (`comp.inputOtp.*`) via the Restyle theme. Entry is
 * sequential: typing advances focus, Backspace on an empty cell deletes the
 * last character and moves back, and a multi-character paste is distributed
 * across the cells.
 */
export function InputOTP({
  length = 6,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  mode = 'numeric',
  mask = false,
  disabled = false,
  invalid = false,
  label,
  testID,
  accessibilityLabel,
}: InputOTPProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    sanitize(defaultValue, mode).slice(0, length),
  );
  const current = isControlled ? sanitize(value, mode).slice(0, length) : internalValue;

  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  const focusCell = (index: number) => {
    const clamped = Math.max(0, Math.min(index, length - 1));
    inputsRef.current[clamped]?.focus();
    setFocusedIndex(clamped);
  };

  const commit = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
    if (next.length === length) {
      onComplete?.(next);
    }
  };

  const handleChangeText = (index: number, raw: string) => {
    if (disabled) {
      return;
    }
    const chars = sanitize(raw, mode);
    if (chars === '') {
      return;
    }
    if (chars.length > 1) {
      // Multi-character entry (paste): distribute from this cell onward.
      const next = (current.slice(0, index) + chars).slice(0, length);
      commit(next);
      focusCell(Math.min(next.length, length - 1));
      return;
    }
    const next =
      index < current.length
        ? current.slice(0, index) + chars + current.slice(index + 1)
        : (current + chars).slice(0, length);
    commit(next);
    focusCell(Math.min(index + 1, length - 1));
  };

  const handleKeyPress = (
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (disabled) {
      return;
    }
    if (event.nativeEvent.key === 'Backspace' && (current[index] ?? '') === '') {
      // Backspace on an empty cell removes the last filled character.
      if (current.length > 0) {
        const next = current.slice(0, -1);
        commit(next);
        focusCell(next.length);
      }
    }
  };

  return (
    <Box flexDirection="column" gap="xs">
      {label !== undefined ? (
        <Text variant="label" color="inputOtpTextValue">
          {label}
        </Text>
      ) : null}
      <Box
        flexDirection="row"
        gap="inputOtpGap"
        testID={testID}
        accessibilityLabel={label ?? accessibilityLabel}
      >
        {Array.from({ length }, (_, index) => (
          <OtpCell
            // biome-ignore lint/suspicious/noArrayIndexKey: cells are a fixed positional row keyed by slot index
            key={index}
            char={current[index] ?? ''}
            active={focusedIndex === index}
            filled={index < current.length}
            disabled={disabled}
            invalid={invalid}
            mask={mask}
            mode={mode}
            accessibilityLabel={`Digit ${index + 1}`}
            testID={testID ? `${testID}-${index}` : undefined}
            inputRef={(node) => {
              inputsRef.current[index] = node;
            }}
            onFocus={() => setFocusedIndex(index)}
            onChangeText={(text) => handleChangeText(index, text)}
            onKeyPress={(event) => handleKeyPress(index, event)}
          />
        ))}
      </Box>
    </Box>
  );
}
