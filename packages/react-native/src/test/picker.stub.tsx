import type { ReactNode } from 'react';

/**
 * Test-only stand-in for `@react-native-picker/picker`.
 *
 * The real picker needs a Metro/Vite web bundler to load its platform modules
 * and cannot run in a plain jsdom + Node test runner. Production code
 * (Storybook web + native) uses the real package — this stub is wired in only
 * for unit tests (see `vitest.config.ts`), mapping `<Picker>`/`<Picker.Item>`
 * onto native `<select>`/`<option>` so `NativeSelect`'s data-driven option
 * rendering, selection and focus handling can be asserted.
 */

interface PickerProps {
  selectedValue?: string;
  onValueChange?: (value: string, index: number) => void;
  enabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  children?: ReactNode;
}

interface PickerItemProps {
  label?: string;
  value?: string;
  color?: string;
}

function PickerItem({ label, value }: PickerItemProps) {
  return <option value={value}>{label}</option>;
}

export function Picker({
  selectedValue,
  onValueChange,
  enabled,
  testID,
  accessibilityLabel,
  onFocus,
  onBlur,
  children,
}: PickerProps) {
  return (
    <select
      data-testid={testID}
      aria-label={accessibilityLabel}
      value={selectedValue ?? ''}
      disabled={enabled === false}
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={(event) => onValueChange?.(event.target.value, 0)}
    >
      {children}
    </select>
  );
}

Picker.Item = PickerItem;
