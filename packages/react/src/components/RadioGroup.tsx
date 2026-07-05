import { tokens } from '@ghds/tokens';
import { type CSSProperties, createContext, type ReactNode, useId, useMemo } from 'react';

export interface RadioGroupContextValue {
  readonly name: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly disabled?: boolean;
}

/** Internal — read by `Radio` when rendered inside a `RadioGroup`. */
export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  /**
   * Shared `name` for the underlying native radio inputs. Auto-generated when
   * omitted — every `Radio` in the group must share the same `name` for native
   * mutual exclusivity and arrow-key roving to work; this context is what lets
   * a consumer skip repeating it on every `Radio`.
   */
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name for the group, rendered as a visible `<legend>`. */
  label?: string;
  /** Direction to stack child radios. Defaults to `'column'`. */
  layout?: 'row' | 'column';
  /** Disables every radio in the group. */
  disabled?: boolean;
  children: ReactNode;
}

/**
 * Groups related `Radio` controls under one shared `name`, so only one can be
 * checked at a time — native `<input type="radio">` semantics (mutual
 * exclusivity, arrow-key roving between radios sharing a `name`) apply for
 * free once every `Radio` shares this group's `name`.
 */
export function RadioGroup({
  name,
  value,
  onValueChange,
  label,
  layout = 'column',
  disabled,
  children,
}: RadioGroupProps) {
  const reactId = useId();
  const groupName = name ?? reactId;

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
    () => ({ name: groupName, value, onValueChange, disabled }),
    [groupName, value, onValueChange, disabled],
  );

  return (
    <fieldset style={fieldsetStyle}>
      {label !== undefined && <legend>{label}</legend>}
      <div style={listStyle}>
        <RadioGroupContext.Provider value={contextValue}>{children}</RadioGroupContext.Provider>
      </div>
    </fieldset>
  );
}
