import { createContext, type ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { Box, Text } from '../theme/primitives.js';

export interface CheckboxGroupContextValue {
  readonly value: string[];
  readonly onValueChange: (value: string[]) => void;
  readonly disabled?: boolean;
}

/** Internal — read by `Checkbox` when rendered inside a `CheckboxGroup`. */
export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

/** Props for {@link CheckboxGroup}. */
export interface CheckboxGroupProps {
  /** Currently checked values. */
  value: string[];
  onValueChange: (value: string[]) => void;
  /** Accessible group name. */
  label?: string;
  /** Direction to stack child checkboxes. Defaults to `'column'`. */
  layout?: 'row' | 'column';
  /** Disables every checkbox in the group. */
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Groups related `Checkbox` controls, managing a shared `value: string[]`.
 * Unlike `RadioGroup`, checkboxes are independently selectable — this is a
 * layout + accessible-group wrapper plus shared state, not a
 * mutual-exclusivity mechanism.
 */
export function CheckboxGroup({
  value,
  onValueChange,
  label,
  layout = 'column',
  disabled,
  children,
}: CheckboxGroupProps) {
  const style: ViewStyle = { flexDirection: layout === 'row' ? 'row' : 'column' };

  return (
    <Box accessibilityLabel={label}>
      {label !== undefined && (
        <Box paddingBottom="xs">
          <Text variant="label" color="textSecondary">
            {label}
          </Text>
        </Box>
      )}
      <Box style={style} gap="sm">
        <CheckboxGroupContext.Provider value={{ value, onValueChange, disabled }}>
          {children}
        </CheckboxGroupContext.Provider>
      </Box>
    </Box>
  );
}
