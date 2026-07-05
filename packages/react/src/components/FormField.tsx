import { tokens } from '@ghds/tokens';
import { Label } from '@radix-ui/react-label';
import { type CSSProperties, createContext, type ReactNode, useMemo } from 'react';
import { useFieldId } from '../hooks/useFieldId.js';
import { cssVars } from '../lib/cssVars.js';

export interface FormFieldContextValue {
  readonly id: string;
  /** Ids of every helper/error element currently rendered — join for `aria-describedby`. */
  readonly describedByIds: readonly string[];
  readonly invalid: boolean;
  /** Whether `FormField` itself was given a `label` — see `useFormFieldWiring`. */
  readonly hasLabel: boolean;
}

/** Internal — read by `Input`/`Textarea` when rendered inside a `FormField`. */
export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export interface FormFieldProps {
  /** Visible label for the wrapped control. */
  label?: string;
  /** Non-error descriptive text, always shown regardless of error state. */
  helperText?: string;
  /** Error message. When set, the wrapped control is marked invalid. */
  error?: string;
  /** Id applied to the wrapped control (and used to derive helper/error ids). */
  id?: string;
  /** A single form control — reads id/aria-invalid/aria-describedby from context. */
  children: ReactNode;
}

/**
 * Composes a Label + HelperText + ErrorText around a single form control,
 * auto-wiring `aria-describedby`/`aria-invalid` via context. Only `Input` and
 * `Textarea` consume this context today — Checkbox/Radio/Switch/Select/Slider
 * have no error concept yet, so wrapping them in `FormField` renders the
 * label/helper/error text but does not (yet) suppress their own rendering or
 * wire anything into them.
 *
 * When wrapping `Input`/`Textarea`, prefer passing `label`/`error` to
 * `FormField` rather than the wrapped control — but if the control's own
 * `label`/`error` is set and `FormField` didn't supply one, the control's own
 * still renders (see `useFormFieldWiring`) rather than being silently
 * dropped.
 */
export function FormField({ label, helperText, error, id, children }: FormFieldProps) {
  const fieldId = useFieldId(id);
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  const hasHelperText = helperText !== undefined && helperText !== '';
  const hasError = error !== undefined && error !== '';

  const describedByIds = useMemo(() => {
    const ids: string[] = [];
    if (hasHelperText) {
      ids.push(helperId);
    }
    if (hasError) {
      ids.push(errorId);
    }
    return ids;
  }, [hasHelperText, hasError, helperId, errorId]);

  const hasLabel = label !== undefined;

  const contextValue = useMemo<FormFieldContextValue>(
    () => ({ id: fieldId, describedByIds, invalid: hasError, hasLabel }),
    [fieldId, describedByIds, hasError, hasLabel],
  );

  const fieldStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.sys.spacing.xs,
    fontFamily: tokens.sys.typography.body.fontFamily,
  };

  const labelStyle: CSSProperties = {
    color: cssVars.sys.color.text.primary,
    fontFamily: tokens.sys.typography.label.fontFamily,
    fontSize: tokens.sys.typography.label.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: String(tokens.sys.typography.label.lineHeight),
  };

  const helperStyle: CSSProperties = {
    color: cssVars.sys.color.text.secondary,
    fontFamily: tokens.sys.typography.caption.fontFamily,
    fontSize: tokens.sys.typography.caption.fontSize,
    fontWeight: tokens.sys.typography.caption.fontWeight,
    lineHeight: String(tokens.sys.typography.caption.lineHeight),
  };

  const errorStyle: CSSProperties = {
    color: cssVars.sys.color.text.danger,
    fontFamily: tokens.sys.typography.caption.fontFamily,
    fontSize: tokens.sys.typography.caption.fontSize,
    fontWeight: tokens.sys.typography.caption.fontWeight,
    lineHeight: String(tokens.sys.typography.caption.lineHeight),
  };

  return (
    <div style={fieldStyle}>
      {label !== undefined && (
        <Label htmlFor={fieldId} style={labelStyle}>
          {label}
        </Label>
      )}
      <FormFieldContext.Provider value={contextValue}>{children}</FormFieldContext.Provider>
      {hasHelperText && (
        <span id={helperId} style={helperStyle}>
          {helperText}
        </span>
      )}
      {hasError && (
        <span id={errorId} role="alert" style={errorStyle}>
          {error}
        </span>
      )}
    </div>
  );
}
