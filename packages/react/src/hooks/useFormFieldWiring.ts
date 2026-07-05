import { useContext } from 'react';
import { FormFieldContext } from '../components/FormField.js';
import { useFieldId } from './useFieldId.js';

export interface FormFieldWiring {
  /** Id to render on the control — the wrapping `FormField`'s id when present. */
  readonly fieldId: string;
  /** Id of this control's own error text, if it renders one (see `showOwnError`). */
  readonly errorId: string;
  /** Whether the control should render as invalid (`aria-invalid`). */
  readonly hasError: boolean;
  /** Value for `aria-describedby`, or `undefined` if nothing describes the control. */
  readonly describedBy: string | undefined;
  /** Whether the control should render its own `label`. */
  readonly showLabel: boolean;
  /** Whether the control should render its own error text/span. */
  readonly showOwnError: boolean;
}

/**
 * Resolves a form control's id/label/error wiring, reading a wrapping
 * `FormField`'s context when present and falling back to today's standalone
 * behavior otherwise. Shared by `Input`/`Textarea` so a fix here (like the
 * fallback rules below) never drifts between the two copies.
 *
 * When wrapped, `FormField`'s id/invalid state take precedence (the `Label`
 * it already rendered points at its own id, so the control must use that
 * same id regardless of its own `id` prop) — but the control's own
 * `label`/`error` still render if `FormField` didn't supply one, so passing
 * both by mistake never silently loses the field's label or error.
 */
export function useFormFieldWiring(
  id: string | undefined,
  label: string | undefined,
  error: string | undefined,
): FormFieldWiring {
  const formField = useContext(FormFieldContext);
  const ownId = useFieldId(id);
  const fieldId = formField?.id ?? ownId;
  const errorId = `${fieldId}-error`;
  const hasOwnError = error !== undefined && error !== '';
  const formFieldInvalid = formField?.invalid ?? false;
  const hasError = formFieldInvalid || hasOwnError;
  const showOwnError = hasOwnError && !formFieldInvalid;
  const showLabel = label !== undefined && !(formField?.hasLabel ?? false);

  const describedByIds = formField ? [...formField.describedByIds] : [];
  if (showOwnError) {
    describedByIds.push(errorId);
  }
  const describedBy = describedByIds.length > 0 ? describedByIds.join(' ') : undefined;

  return { fieldId, errorId, hasError, describedBy, showLabel, showOwnError };
}
