import type { ReactNode } from 'react';
import { Box, Text } from '../theme/primitives.js';

/** Props for {@link FormField}. */
export interface FormFieldProps {
  /** Visible label. Primarily useful for wrapping `Input`, which has no `label` prop of its own. */
  label?: string;
  /** Non-error descriptive text, always shown regardless of error state. */
  helperText?: string;
  /** Error message, shown alongside `helperText` if both are set. */
  error?: string;
  /** A single form control. */
  children: ReactNode;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * Composes a label + helper/error text around a single form control.
 *
 * **Visual composition only** — React Native has no id/`aria-describedby`
 * equivalent on any platform, so there is no automatic accessibility linkage
 * between this field's helper/error text and the wrapped control the way
 * `FormField` wires it on React/Web Components. A screen-reader user
 * focusing the control will not automatically hear the helper/error text; a
 * real, permanent platform gap, not something faked via prop-cloning.
 *
 * Primary value-add: giving RN's own `Input` (which has no `label` prop) a
 * label when wrapped. Controls that already render their own label
 * (`Textarea`, `Checkbox`, `Radio`, `Switch`, `Select`, `Slider`) should omit
 * `FormField`'s `label` when wrapping them, to avoid a purely-visual doubled
 * label.
 */
export function FormField({ label, helperText, error, children, testID }: FormFieldProps) {
  const hasLabel = label !== undefined && label !== '';
  const hasHelperText = helperText !== undefined && helperText !== '';
  const hasError = error !== undefined && error !== '';

  return (
    <Box testID={testID}>
      {hasLabel && (
        <Text variant="label" color="textSecondary" paddingBottom="xs">
          {label}
        </Text>
      )}
      {children}
      {hasHelperText && (
        <Text variant="caption" color="textSecondary" paddingTop="xs">
          {helperText}
        </Text>
      )}
      {hasError && (
        <Text variant="caption" color="textDanger" paddingTop="xs">
          {error}
        </Text>
      )}
    </Box>
  );
}
