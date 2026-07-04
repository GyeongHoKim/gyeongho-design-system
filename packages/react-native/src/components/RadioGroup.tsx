import { createContext, type ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { Box, Text } from '../theme/primitives.js';

export interface RadioGroupContextValue {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
}

/** Internal — read by `Radio` when rendered inside a `RadioGroup`. */
export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/** Props for {@link RadioGroup}. */
export interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible group name. */
  label?: string;
  /** Direction to stack child radios. Defaults to `'column'`. */
  layout?: 'row' | 'column';
  /** Disables every radio in the group. */
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Groups related `Radio` controls, deriving `checked` for each from this
 * group's own `value` and enforcing mutual exclusivity — only one `Radio`
 * value can be selected at a time.
 */
export function RadioGroup({
  value,
  onValueChange,
  label,
  layout = 'column',
  disabled,
  children,
}: RadioGroupProps) {
  const style: ViewStyle = { flexDirection: layout === 'row' ? 'row' : 'column' };

  return (
    <Box accessibilityRole="radiogroup" accessibilityLabel={label}>
      {label !== undefined && (
        <Box paddingBottom="xs">
          <Text variant="label" color="textSecondary">
            {label}
          </Text>
        </Box>
      )}
      <Box style={style} gap="sm">
        <RadioGroupContext.Provider value={{ value, onValueChange, disabled }}>
          {children}
        </RadioGroupContext.Provider>
      </Box>
    </Box>
  );
}
