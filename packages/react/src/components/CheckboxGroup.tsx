import { tokens } from '@ghds/tokens';
import { type CSSProperties, createContext, type ReactNode, useMemo } from 'react';

export interface CheckboxGroupContextValue {
  readonly value: string[];
  readonly onValueChange: (value: string[]) => void;
  readonly disabled?: boolean;
}

/** Internal — read by `Checkbox` when rendered inside a `CheckboxGroup`. */
export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export interface CheckboxGroupProps {
  /** Currently checked values. */
  value: string[];
  onValueChange: (value: string[]) => void;
  /** Accessible name for the group, rendered as the `<fieldset>`'s `<legend>`. */
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
 * layout + native `<fieldset>`/`<legend>` grouping plus shared state, not a
 * mutual-exclusivity mechanism. A `Checkbox` given a `value` prop reads
 * `checked`/emits changes through this context; without a surrounding group,
 * `Checkbox` works exactly like a standalone native checkbox.
 */
export function CheckboxGroup({
  value,
  onValueChange,
  label,
  layout = 'column',
  disabled,
  children,
}: CheckboxGroupProps) {
  const fieldsetStyle: CSSProperties = {
    border: 'none',
    margin: 0,
    padding: 0,
  };

  const listStyle: CSSProperties = {
    display: 'flex',
    flexDirection: layout === 'row' ? 'row' : 'column',
    gap: tokens.sys.spacing.sm,
  };

  const contextValue = useMemo(
    () => ({ value, onValueChange, disabled }),
    [value, onValueChange, disabled],
  );

  return (
    <fieldset style={fieldsetStyle}>
      {label !== undefined && <legend>{label}</legend>}
      <div style={listStyle}>
        <CheckboxGroupContext.Provider value={contextValue}>
          {children}
        </CheckboxGroupContext.Provider>
      </div>
    </fieldset>
  );
}
