import { tokens } from '@ghds/tokens';
import { Label as RadixLabel } from '@radix-ui/react-label';
import { type ComponentPropsWithoutRef, type CSSProperties, forwardRef } from 'react';
import { cssVars } from '../lib/cssVars.js';

export interface LabelProps extends ComponentPropsWithoutRef<typeof RadixLabel> {
  /** Renders the label in its disabled colour when `true`. */
  disabled?: boolean;
}

const c = cssVars.comp.label;

/**
 * A form label. Wraps Radix `Label` so clicking it focuses/activates the
 * associated control (`htmlFor`, or a nested control). Typography comes from
 * `sys.typography.label` and colour from `@ghds/tokens` (`comp.label.*`). Not
 * sketchy — it is plain text that accompanies a hand-drawn control.
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { disabled = false, style, ...rest },
  forwardedRef,
) {
  const labelStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: c.gap,
    color: disabled ? c.text.disabled : c.text.default,
    cursor: disabled ? 'not-allowed' : 'default',
    fontFamily: tokens.sys.typography.label.fontFamily,
    fontSize: tokens.sys.typography.label.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: String(tokens.sys.typography.label.lineHeight),
    ...style,
  };

  return (
    <RadixLabel
      ref={forwardedRef}
      data-disabled={disabled || undefined}
      style={labelStyle}
      {...rest}
    />
  );
});
