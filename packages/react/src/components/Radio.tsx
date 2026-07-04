import { ellipse } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { Label } from '@radix-ui/react-label';
import {
  type ChangeEvent,
  type CSSProperties,
  forwardRef,
  type InputHTMLAttributes,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { RadioGroupContext } from './RadioGroup.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visible label. Associated to the input via Radix `Label` for accessibility. */
  label?: string;
  /** This radio's own value — required, since a radio must identify itself within a group. */
  value: string;
}

const radio = tokens.comp.radio;
const c = cssVars.comp.radio;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const SIZE = toPx(tokens.comp.radio.size);
const DOT_INSET = SIZE / 4;

function resolveStroke(checked: boolean, hovered: boolean, disabled: boolean): string {
  if (disabled) {
    return c.stroke.disabled;
  }
  if (checked) {
    return c.stroke.checked;
  }
  return hovered ? c.stroke.hover : c.stroke.default;
}

/**
 * A hand-drawn radio button. The ring comes from `@ghds/sketch-core` (via
 * {@link useSketch}, `shape: 'ellipse'`); the checked dot is a second, smaller
 * ellipse computed directly from `@ghds/sketch-core`, sharing the ring's
 * measured box and seed. A real `<input type="radio">` carries all native
 * keyboard/focus/mutual-exclusivity behavior — inside a `RadioGroup`, sharing
 * `name` gives arrow-key roving between radios for free.
 *
 * Used standalone (controlled via `checked`/`onChange`, or uncontrolled via
 * `defaultChecked`) or inside a `RadioGroup`, which supplies `name` and derives
 * `checked` from the group's own `value`.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    label,
    value,
    checked,
    defaultChecked,
    disabled = false,
    style,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onChange,
    id,
    name,
    ...rest
  },
  forwardedRef,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const group = useContext(RadioGroupContext);

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);

  const isChecked = group ? group.value === value : (checked ?? internalChecked);
  const isDisabled = disabled || group?.disabled === true;
  const inputName = group?.name ?? name;

  const {
    ref: sketchRef,
    drawable,
    size,
    seed,
  } = useSketch<HTMLDivElement>({
    shape: 'ellipse',
    roughness: radio.sketch.roughness,
    bowing: radio.sketch.bowing,
    fillStyle: 'solid',
    inset: INSET,
  });

  const dot = useMemo(() => {
    if (!isChecked || size.width <= 0 || size.height <= 0) {
      return null;
    }
    return ellipse(DOT_INSET, DOT_INSET, size.width - DOT_INSET * 2, size.height - DOT_INSET * 2, {
      roughness: radio.sketch.roughness,
      bowing: radio.sketch.bowing,
      seed,
      fillStyle: 'solid',
    });
  }, [isChecked, size, seed]);

  const stroke = resolveStroke(isChecked, hovered, isDisabled);
  const dotColor = isDisabled ? c.dot.disabled : c.dot.default;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (group) {
      group.onValueChange(value);
    } else if (checked === undefined) {
      setInternalChecked(true);
    }
    onChange?.(event);
  };

  const fieldStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: radio.gap,
    fontFamily: tokens.sys.typography.body.fontFamily,
  };

  const boxStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-flex',
    boxSizing: 'border-box',
    width: SIZE,
    height: SIZE,
    flexShrink: 0,
    borderRadius: '50%',
    outline: focused ? `${STROKE_WIDTH}px solid ${c.stroke.focus}` : 'none',
    outlineOffset: tokens.sys.spacing.xs,
    ...style,
  };

  const inputStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    opacity: 0,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
  };

  const labelStyle: CSSProperties = {
    color: isDisabled ? c.text.disabled : c.text.label,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
  };

  const ref = mergeRefs(sketchRef, forwardedRef);

  return (
    <span style={fieldStyle}>
      <span style={boxStyle}>
        <SketchSurface
          drawable={drawable}
          width={size.width}
          height={size.height}
          strokeColor={stroke}
          strokeWidth={STROKE_WIDTH}
        />
        {dot && (
          <SketchSurface
            drawable={dot}
            width={size.width}
            height={size.height}
            strokeColor={dotColor}
            strokeWidth={STROKE_WIDTH}
            fillColor={dotColor}
            fillRendering="fill"
          />
        )}
        <input
          ref={ref}
          type="radio"
          id={inputId}
          name={inputName}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          style={inputStyle}
          onChange={handleChange}
          onMouseEnter={(event) => {
            setHovered(true);
            onMouseEnter?.(event);
          }}
          onMouseLeave={(event) => {
            setHovered(false);
            onMouseLeave?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
      </span>
      {label !== undefined && (
        <Label htmlFor={inputId} style={labelStyle}>
          {label}
        </Label>
      )}
    </span>
  );
});
