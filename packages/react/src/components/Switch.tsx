import { ellipse } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { Label } from '@radix-ui/react-label';
import {
  type ChangeEvent,
  type CSSProperties,
  forwardRef,
  type InputHTMLAttributes,
  useId,
  useMemo,
  useState,
} from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'role' | 'aria-checked'> {
  /** Visible label. Associated to the input via Radix `Label` for accessibility. */
  label?: string;
}

const sw = tokens.comp.switch;
const c = cssVars.comp.switch;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const TRACK_WIDTH = toPx(tokens.comp.switch.track.width);
const TRACK_HEIGHT = toPx(tokens.comp.switch.track.height);
const THUMB_SIZE = toPx(tokens.comp.switch.thumb.size);
const THUMB_INSET = toPx(tokens.comp.switch.thumb.inset);

/**
 * A hand-drawn switch (toggle). Renders a real
 * `<input type="checkbox" role="switch">` — browsers compute `aria-checked`
 * from the native `checked` property regardless of the role override, so
 * Space toggles and correct AT announcement come free, no custom keydown
 * handler. The track comes from `@ghds/sketch-core` (via {@link useSketch});
 * the thumb is a second, smaller ellipse computed directly from
 * `@ghds/sketch-core`, positioned left/right based on checked state.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
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
    ...rest
  },
  forwardedRef,
) {
  const reactId = useId();
  const inputId = id ?? reactId;

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);

  const isChecked = checked ?? internalChecked;

  const {
    ref: sketchRef,
    drawable,
    size,
    seed,
  } = useSketch<HTMLDivElement>({
    shape: 'rectangle',
    roughness: sw.sketch.roughness,
    bowing: sw.sketch.bowing,
    fillStyle: 'solid',
    inset: INSET,
  });

  const thumb = useMemo(() => {
    if (size.width <= 0 || size.height <= 0) {
      return null;
    }
    const y = (size.height - THUMB_SIZE) / 2;
    const x = isChecked ? size.width - THUMB_SIZE - THUMB_INSET : THUMB_INSET;
    return ellipse(x, y, THUMB_SIZE, THUMB_SIZE, {
      roughness: sw.sketch.roughness,
      bowing: sw.sketch.bowing,
      seed,
      fillStyle: 'solid',
    });
  }, [isChecked, size, seed]);

  const trackFill = disabled
    ? isChecked
      ? c.bg.on.disabled
      : c.bg.off.disabled
    : isChecked
      ? hovered
        ? c.bg.on.hover
        : c.bg.on.default
      : c.bg.off.default;
  const trackStroke = disabled
    ? c.stroke.disabled
    : isChecked
      ? c.stroke.checked
      : c.stroke.default;
  const thumbColor = disabled ? c.thumb.color.disabled : c.thumb.color.default;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (checked === undefined) {
      setInternalChecked(event.target.checked);
    }
    onChange?.(event);
  };

  const fieldStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: sw.gap,
    fontFamily: tokens.sys.typography.body.fontFamily,
  };

  const trackStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-block',
    boxSizing: 'border-box',
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    flexShrink: 0,
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
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const labelStyle: CSSProperties = {
    color: disabled ? c.text.disabled : c.text.label,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
  };

  const ref = mergeRefs(sketchRef, forwardedRef);

  return (
    <span style={fieldStyle}>
      <span style={trackStyle}>
        <SketchSurface
          drawable={drawable}
          width={size.width}
          height={size.height}
          strokeColor={trackStroke}
          strokeWidth={STROKE_WIDTH}
          fillColor={trackFill}
          fillRendering="fill"
        />
        {thumb && (
          <SketchSurface
            drawable={thumb}
            width={size.width}
            height={size.height}
            strokeColor={thumbColor}
            strokeWidth={STROKE_WIDTH}
            fillColor={thumbColor}
            fillRendering="fill"
          />
        )}
        <input
          {...rest}
          ref={ref}
          type="checkbox"
          role="switch"
          id={inputId}
          checked={isChecked}
          aria-checked={isChecked}
          disabled={disabled}
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
