import { ellipse, rectangle } from '@ghds/sketch-core';
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

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visible label. Associated to the input via Radix `Label` for accessibility. */
  label?: string;
}

const slider = tokens.comp.slider;
const c = cssVars.comp.slider;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const TRACK_HEIGHT = toPx(tokens.comp.slider.track.height);
const THUMB_SIZE = toPx(tokens.comp.slider.thumb.size);

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;

function resolveThumbStroke(hovered: boolean, focused: boolean, disabled: boolean): string {
  if (disabled) {
    return c.thumb.stroke.disabled;
  }
  if (focused) {
    return c.thumb.stroke.focus;
  }
  return hovered ? c.thumb.stroke.hover : c.thumb.stroke.default;
}

/**
 * A hand-drawn range slider. A real `<input type="range">` — invisible,
 * spanning the full track — carries every interaction: dragging, clicking the
 * track, and the browser's own Arrow/Home/End/PageUp/PageDown keyboard
 * behavior, with zero custom keydown/pointer handling. The rail, fill, and
 * thumb are three shapes computed directly from `@ghds/sketch-core`, sharing
 * one measured box and seed — the same multi-shape trick `Radio`/`Switch`
 * already use for their dot/thumb (the thumb is drawn taller than the thin
 * rail, so all geometry is derived manually rather than via `useSketch`'s own
 * single default rectangle).
 *
 * v1 scope: a single thumb (no two-thumb range mode), horizontal only.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    label,
    value,
    defaultValue,
    min = DEFAULT_MIN,
    max = DEFAULT_MAX,
    step = DEFAULT_STEP,
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
  const [internalValue, setInternalValue] = useState(() => Number(defaultValue ?? min));

  const currentValue = value !== undefined ? Number(value) : internalValue;
  const numericMin = Number(min);
  const numericMax = Number(max);
  const percent =
    numericMax > numericMin
      ? Math.min(1, Math.max(0, (currentValue - numericMin) / (numericMax - numericMin)))
      : 0;

  // Only `size`/`seed` are used — the rail/fill/thumb geometry is computed
  // manually below (not via the hook's own default rectangle) because the
  // thumb is deliberately taller than the thin rail, so all three shapes must
  // share one viewBox with independently chosen vertical bounds.
  const {
    ref: sketchRef,
    size,
    seed,
  } = useSketch<HTMLDivElement>({
    shape: 'rectangle',
    roughness: slider.sketch.roughness,
    bowing: slider.sketch.bowing,
    fillStyle: 'solid',
    inset: INSET,
  });

  const railX = INSET;
  const railY = (size.height - TRACK_HEIGHT) / 2 + INSET;
  const railWidth = size.width - INSET * 2;
  const railHeight = Math.max(1, TRACK_HEIGHT - INSET * 2);
  const thumbCenterX = percent * (size.width - THUMB_SIZE) + THUMB_SIZE / 2;
  const thumbX = thumbCenterX - THUMB_SIZE / 2;
  const thumbY = (size.height - THUMB_SIZE) / 2;

  const rail = useMemo(() => {
    if (railWidth <= 0 || size.height <= 0) {
      return null;
    }
    return rectangle(railX, railY, railWidth, railHeight, {
      roughness: slider.sketch.roughness,
      bowing: slider.sketch.bowing,
      seed,
      fillStyle: 'solid',
    });
  }, [railY, railWidth, railHeight, size.height, seed]);

  const fill = useMemo(() => {
    const fillWidth = Math.max(0, Math.min(railWidth, thumbCenterX - railX));
    if (fillWidth <= 0 || size.height <= 0) {
      return null;
    }
    return rectangle(railX, railY, fillWidth, railHeight, {
      roughness: slider.sketch.roughness,
      bowing: slider.sketch.bowing,
      seed,
      fillStyle: 'solid',
    });
  }, [railY, railWidth, railHeight, thumbCenterX, size.height, seed]);

  const thumb = useMemo(() => {
    if (size.width <= 0 || size.height <= 0) {
      return null;
    }
    return ellipse(thumbX, thumbY, THUMB_SIZE, THUMB_SIZE, {
      roughness: slider.sketch.roughness,
      bowing: slider.sketch.bowing,
      seed,
      fillStyle: 'solid',
    });
  }, [thumbX, thumbY, size.width, size.height, seed]);

  const railStroke = disabled ? c.stroke.disabled : c.stroke.default;
  const railFill = disabled ? c.bg.rail.disabled : c.bg.rail.default;
  const fillColor = disabled ? c.bg.fill.disabled : hovered ? c.bg.fill.hover : c.bg.fill.default;
  const thumbFill = disabled ? c.thumb.bg.disabled : c.thumb.bg.default;
  const thumbStroke = resolveThumbStroke(hovered, focused, disabled);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) {
      setInternalValue(Number(event.target.value));
    }
    onChange?.(event);
  };

  const fieldStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: slider.gap,
    fontFamily: tokens.sys.typography.body.fontFamily,
  };

  const trackStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'block',
    boxSizing: 'border-box',
    width: '100%',
    height: THUMB_SIZE,
    outline: focused ? `${STROKE_WIDTH}px solid ${c.thumb.stroke.focus}` : 'none',
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
      {label !== undefined && (
        <Label htmlFor={inputId} style={labelStyle}>
          {label}
        </Label>
      )}
      <span style={trackStyle}>
        <SketchSurface
          drawable={rail}
          width={size.width}
          height={size.height}
          strokeColor={railStroke}
          strokeWidth={STROKE_WIDTH}
          fillColor={railFill}
          fillRendering="fill"
        />
        {fill && (
          <SketchSurface
            drawable={fill}
            width={size.width}
            height={size.height}
            strokeColor={fillColor}
            strokeWidth={STROKE_WIDTH}
            fillColor={fillColor}
            fillRendering="fill"
          />
        )}
        {thumb && (
          <SketchSurface
            drawable={thumb}
            width={size.width}
            height={size.height}
            strokeColor={thumbStroke}
            strokeWidth={STROKE_WIDTH}
            fillColor={thumbFill}
            fillRendering="fill"
          />
        )}
        <input
          {...rest}
          ref={ref}
          type="range"
          id={inputId}
          min={min}
          max={max}
          step={step}
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
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
    </span>
  );
});
