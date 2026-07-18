import { tokens } from '@ghds/tokens';
import { Label } from '@radix-ui/react-label';
import {
  type CSSProperties,
  type FocusEvent,
  forwardRef,
  type SelectHTMLAttributes,
  useState,
} from 'react';
import { useFormFieldWiring } from '../hooks/useFormFieldWiring.js';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { toPx } from '../lib/units.js';
import { Icon } from './Icon.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface NativeSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Visible label. Associated to the select via Radix `Label` for accessibility. */
  label?: string;
  /** Error message. When set, the field is marked invalid and the text announced. */
  error?: string;
}

const nativeSelect = tokens.comp.nativeSelect;
const c = cssVars.comp.nativeSelect;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

function resolveStroke(focused: boolean, hasError: boolean): string {
  if (hasError) {
    return c.stroke.danger;
  }
  return focused ? c.stroke.focus : c.stroke.default;
}

/**
 * A hand-drawn wrapper around a real native `<select>`. Unlike {@link Select}
 * (a fully custom listbox), this keeps the platform's native dropdown — useful
 * on touch devices and for long option lists — and only restyles the closed
 * control with the sketchy box and a chevron. Every colour, padding, radius and
 * sketch parameter comes from `@ghds/tokens` (`comp.nativeSelect.*`). A Radix
 * `Label` is associated with the `<select>`, and error state is exposed via
 * `aria-invalid` + `aria-describedby` and a `role="alert"` message.
 */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  {
    label,
    error,
    id,
    disabled = false,
    style,
    children,
    onFocus,
    onBlur,
    'aria-describedby': ariaDescribedByProp,
    'aria-invalid': ariaInvalidProp,
    ...rest
  },
  forwardedRef,
) {
  const {
    fieldId: selectId,
    errorId,
    hasError,
    describedBy,
    showLabel,
    showOwnError,
  } = useFormFieldWiring(id, label, error);

  const [focused, setFocused] = useState(false);

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: nativeSelect.sketch.roughness,
    bowing: nativeSelect.sketch.bowing,
    inset: INSET,
  });

  const fieldStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: nativeSelect.gap,
    fontFamily: tokens.sys.typography.body.fontFamily,
    ...style,
  };

  const labelStyle: CSSProperties = {
    color: c.text.label,
    fontFamily: tokens.sys.typography.label.fontFamily,
    fontSize: tokens.sys.typography.label.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: String(tokens.sys.typography.label.lineHeight),
  };

  const controlStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  };

  const selectStyle: CSSProperties = {
    flex: 1,
    boxSizing: 'border-box',
    width: '100%',
    margin: 0,
    // Room on the right for the overlaid chevron.
    padding: `${nativeSelect.padding.vertical} calc(${nativeSelect.padding.horizontal} + ${tokens.sys.icon.size.sm}) ${nativeSelect.padding.vertical} ${nativeSelect.padding.horizontal}`,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    color: disabled ? c.text.disabled : c.text.value,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    fontWeight: tokens.sys.typography.body.fontWeight,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const chevronStyle: CSSProperties = {
    position: 'absolute',
    right: nativeSelect.padding.horizontal,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: disabled ? c.icon.disabled : c.icon.default,
  };

  const errorStyle: CSSProperties = {
    color: c.text.danger,
    fontFamily: tokens.sys.typography.caption.fontFamily,
    fontSize: tokens.sys.typography.caption.fontSize,
    fontWeight: tokens.sys.typography.caption.fontWeight,
    lineHeight: String(tokens.sys.typography.caption.lineHeight),
  };

  return (
    <div style={fieldStyle}>
      {showLabel && (
        <Label htmlFor={selectId} style={labelStyle}>
          {label}
        </Label>
      )}
      <div ref={sketchRef} style={controlStyle}>
        <SketchSurface
          drawable={drawable}
          width={size.width}
          height={size.height}
          strokeColor={resolveStroke(focused, hasError)}
          strokeWidth={STROKE_WIDTH}
          fillColor={disabled ? c.bg.disabled : c.bg.default}
          fillRendering="fill"
        />
        <select
          ref={forwardedRef}
          id={selectId}
          disabled={disabled}
          aria-invalid={ariaInvalidProp ?? (hasError || undefined)}
          aria-describedby={
            [ariaDescribedByProp, describedBy].filter(Boolean).join(' ') || undefined
          }
          style={selectStyle}
          onFocus={(event: FocusEvent<HTMLSelectElement>) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event: FocusEvent<HTMLSelectElement>) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        >
          {children}
        </select>
        <Icon name="chevron-down" size="sm" style={chevronStyle} />
      </div>
      {showOwnError && (
        <span id={errorId} role="alert" style={errorStyle}>
          {error}
        </span>
      )}
    </div>
  );
});
