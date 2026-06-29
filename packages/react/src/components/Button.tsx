import { tokens } from '@ghds/tokens';
import { Slot, Slottable } from '@radix-ui/react-slot';
import type React from 'react';
import { type ButtonHTMLAttributes, type CSSProperties, forwardRef, useState } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface } from './SketchSurface.js';

/** Visual intent of the button. */
export type ButtonVariant = 'primary' | 'danger' | 'neutral';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Visual intent. Defaults to `'primary'`. */
  variant?: ButtonVariant;
  /**
   * Render as the single child element (Radix `Slot`) instead of a `<button>`,
   * e.g. to make a link look like a button while keeping its semantics.
   */
  asChild?: boolean;
}

// Sketch numerics + dimensions (theme-independent) come from the raw token
// object; colors come from `c` as CSS-variable references so dark mode applies.
const button = tokens.comp.button;
const c = cssVars.comp.button;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

interface ButtonColors {
  readonly stroke: string;
  readonly text: string;
  readonly fill?: string;
}

interface VariantTokens {
  readonly fill: { default: string; hover: string; active: string };
  readonly stroke: string;
  readonly text: string;
  /** Whether the resting state is filled (`primary`/`danger`) or outline (`neutral`). */
  readonly filledAtRest: boolean;
}

const VARIANTS: Record<ButtonVariant, VariantTokens> = {
  primary: {
    fill: { default: c.bg.primary.default, hover: c.bg.primary.hover, active: c.bg.primary.active },
    stroke: c.stroke.primary,
    text: c.text.primary,
    filledAtRest: true,
  },
  danger: {
    fill: { default: c.bg.danger.default, hover: c.bg.danger.hover, active: c.bg.danger.active },
    stroke: c.stroke.danger,
    text: c.text.danger,
    filledAtRest: true,
  },
  neutral: {
    fill: {
      default: c.bg.neutral.default,
      hover: c.bg.neutral.hover,
      active: c.bg.neutral.active,
    },
    stroke: c.stroke.neutral,
    text: c.text.neutral,
    filledAtRest: false,
  },
};

interface InteractionState {
  readonly hovered: boolean;
  readonly pressed: boolean;
}

function resolveColors(
  variant: ButtonVariant,
  state: InteractionState,
  disabled: boolean,
): ButtonColors {
  const v = VARIANTS[variant];
  if (disabled) {
    return {
      stroke: c.stroke.neutral,
      text: c.text.disabled,
      fill: variant === 'neutral' ? undefined : c.bg.primary.disabled,
    };
  }
  const fill = state.pressed ? v.fill.active : state.hovered ? v.fill.hover : v.fill.default;
  // Outline variants stay unfilled until hovered/pressed.
  const showFill = v.filledAtRest || state.hovered || state.pressed;
  return { stroke: v.stroke, text: v.text, fill: showFill ? fill : undefined };
}

/**
 * A hand-drawn button. Its sketchy outline + fill come from `@ghds/sketch-core`
 * (via {@link useSketch}); every color, padding, radius, typography and sketch
 * parameter is sourced from `@ghds/tokens` (`comp.button.*` / `sys.*`). The
 * accessible `<button>` (or a slotted element via `asChild`) carries all native
 * keyboard/focus behaviour; the SVG is purely decorative (`aria-hidden`).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    asChild = false,
    children,
    disabled = false,
    style,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    onBlur,
    onFocus,
    type,
    ...rest
  },
  forwardedRef,
) {
  const [state, setState] = useState<InteractionState>({ hovered: false, pressed: false });
  const [focused, setFocused] = useState(false);

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLButtonElement>({
    fillStyle: 'solid',
    roughness: button.sketch.roughness,
    bowing: button.sketch.bowing,
    inset: INSET,
  });

  const colors = resolveColors(variant, state, disabled);

  const rootStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: `${button.padding.vertical} ${button.padding.horizontal}`,
    border: 'none',
    background: 'transparent',
    appearance: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: colors.text,
    fontFamily: tokens.sys.typography.label.fontFamily,
    fontSize: tokens.sys.typography.label.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: String(tokens.sys.typography.label.lineHeight),
    outline: focused ? `${STROKE_WIDTH}px solid ${c.focus.ring}` : 'none',
    outlineOffset: tokens.sys.spacing.xs,
    ...style,
  };

  const surface = (
    <SketchSurface
      drawable={drawable}
      width={size.width}
      height={size.height}
      strokeColor={colors.stroke}
      strokeWidth={STROKE_WIDTH}
      fillColor={colors.fill}
      fillRendering="fill"
    />
  );

  const handlers = {
    onMouseEnter: (event: React.MouseEvent<HTMLButtonElement>) => {
      setState((s) => ({ ...s, hovered: true }));
      onMouseEnter?.(event);
    },
    onMouseLeave: (event: React.MouseEvent<HTMLButtonElement>) => {
      setState({ hovered: false, pressed: false });
      onMouseLeave?.(event);
    },
    onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => {
      setState((s) => ({ ...s, pressed: true }));
      onMouseDown?.(event);
    },
    onMouseUp: (event: React.MouseEvent<HTMLButtonElement>) => {
      setState((s) => ({ ...s, pressed: false }));
      onMouseUp?.(event);
    },
    onFocus: (event: React.FocusEvent<HTMLButtonElement>) => {
      setFocused(true);
      onFocus?.(event);
    },
    onBlur: (event: React.FocusEvent<HTMLButtonElement>) => {
      setFocused(false);
      setState({ hovered: false, pressed: false });
      onBlur?.(event);
    },
  };

  const ref = mergeRefs(sketchRef, forwardedRef);

  if (asChild) {
    return (
      <Slot
        ref={ref}
        style={rootStyle}
        data-variant={variant}
        aria-disabled={disabled || undefined}
        {...handlers}
        {...rest}
      >
        {surface}
        <Slottable>{children}</Slottable>
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      style={rootStyle}
      data-variant={variant}
      disabled={disabled}
      {...handlers}
      {...rest}
    >
      {surface}
      <span style={{ position: 'relative' }}>{children}</span>
    </button>
  );
});
