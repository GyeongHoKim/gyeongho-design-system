import { tokens } from '@ghds/tokens';
import { Label } from '@radix-ui/react-label';
import {
  type CSSProperties,
  type FocusEvent,
  forwardRef,
  type InputHTMLAttributes,
  useId,
  useState,
} from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label. Associated to the input via Radix `Label` for accessibility. */
  label?: string;
  /** Error message. When set, the field is marked invalid and the text announced. */
  error?: string;
}

const input = tokens.comp.input;
const c = cssVars.comp.input;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

function resolveStroke(focused: boolean, hasError: boolean): string {
  if (hasError) {
    return c.stroke.danger;
  }
  return focused ? c.stroke.focus : c.stroke.default;
}

/**
 * A hand-drawn text field. The sketchy box (outline + paper fill) is generated
 * by `@ghds/sketch-core` (via {@link useSketch}); every color, padding, radius,
 * typography and sketch parameter comes from `@ghds/tokens` (`comp.input.*`).
 * A Radix `Label` is associated with the native `<input>`, and error state is
 * exposed via `aria-invalid` + `aria-describedby` and an `role="alert"` message.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, disabled = false, style, onFocus, onBlur, ...rest },
  forwardedRef,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const errorId = `${inputId}-error`;
  const hasError = error !== undefined && error !== '';

  const [focused, setFocused] = useState(false);

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: input.sketch.roughness,
    bowing: input.sketch.bowing,
    inset: INSET,
  });

  const fieldStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: input.gap,
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
    // Scopes the `SketchSurface` (`z-index: -1`) to this control so an opaque
    // ancestor can't paint over it (see `sketchHostStyle`).
    ...sketchHostStyle,
    display: 'flex',
    boxSizing: 'border-box',
  };

  const inputStyle: CSSProperties = {
    flex: 1,
    boxSizing: 'border-box',
    width: '100%',
    margin: 0,
    padding: `${input.padding.vertical} ${input.padding.horizontal}`,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: disabled ? c.text.disabled : c.text.value,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    fontWeight: tokens.sys.typography.body.fontWeight,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const errorStyle: CSSProperties = {
    color: c.stroke.danger,
    fontFamily: tokens.sys.typography.caption.fontFamily,
    fontSize: tokens.sys.typography.caption.fontSize,
    fontWeight: tokens.sys.typography.caption.fontWeight,
    lineHeight: String(tokens.sys.typography.caption.lineHeight),
  };

  return (
    <div style={fieldStyle}>
      {label !== undefined && (
        <Label htmlFor={inputId} style={labelStyle}>
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
        <input
          ref={forwardedRef}
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          style={inputStyle}
          onFocus={(event: FocusEvent<HTMLInputElement>) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event: FocusEvent<HTMLInputElement>) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
      </div>
      {hasError && (
        <span id={errorId} role="alert" style={errorStyle}>
          {error}
        </span>
      )}
    </div>
  );
});
