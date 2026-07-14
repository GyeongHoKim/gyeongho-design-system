import { tokens } from '@ghds/tokens';
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  forwardRef,
  type MouseEvent,
  useState,
} from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'aria-pressed'> {
  /** Controlled pressed state. */
  pressed?: boolean;
  /** Initial pressed state when uncontrolled. Defaults to `false`. */
  defaultPressed?: boolean;
  /** Called with the next pressed state when toggled. */
  onPressedChange?: (pressed: boolean) => void;
}

const toggle = tokens.comp.toggle;
const c = cssVars.comp.toggle;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

/**
 * A hand-drawn two-state toggle button. Renders a `<button>` with
 * `aria-pressed`; Space/Enter toggle it natively. The sketchy outline + fill
 * come from `@ghds/sketch-core` (via {@link useSketch}) — the same drawing the
 * `Button` uses — and every colour, padding and sketch parameter comes from
 * `@ghds/tokens` (`comp.toggle.*`). The SVG is decorative (`aria-hidden`).
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    pressed,
    defaultPressed = false,
    onPressedChange,
    children,
    disabled = false,
    style,
    type,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...rest
  },
  forwardedRef,
) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPressed = pressed ?? internalPressed;

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLButtonElement>({
    fillStyle: 'solid',
    roughness: toggle.sketch.roughness,
    bowing: toggle.sketch.bowing,
    inset: INSET,
  });

  const ref = mergeRefs(sketchRef, forwardedRef);

  const fill = isPressed ? c.bg.pressed : hovered ? c.bg.hover : c.bg.default;

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.sys.spacing.xs,
    boxSizing: 'border-box',
    padding: `${toggle.padding.vertical} ${toggle.padding.horizontal}`,
    border: 'none',
    background: 'transparent',
    appearance: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: isPressed ? c.text.pressed : c.text.default,
    fontFamily: tokens.sys.typography.label.fontFamily,
    fontSize: tokens.sys.typography.label.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: String(tokens.sys.typography.label.lineHeight),
    outline: focused ? `${STROKE_WIDTH}px solid ${c.focus.ring}` : 'none',
    outlineOffset: tokens.sys.spacing.xs,
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (pressed === undefined) {
      setInternalPressed((prev) => !prev);
    }
    onPressedChange?.(!isPressed);
    onClick?.(event);
  };

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      aria-pressed={isPressed}
      disabled={disabled}
      data-state={isPressed ? 'on' : 'off'}
      style={rootStyle}
      onClick={handleClick}
      onMouseEnter={(e) => {
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...rest}
    >
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.stroke}
        strokeWidth={STROKE_WIDTH}
        fillColor={fill}
        fillRendering="fill"
      />
      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.sys.spacing.xs,
        }}
      >
        {children}
      </span>
    </button>
  );
});
