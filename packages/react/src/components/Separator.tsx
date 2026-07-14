import { line, type SketchDrawable } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes, useMemo } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Layout axis of a {@link Separator}. */
export type SeparatorOrientation = 'horizontal' | 'vertical';

export interface SeparatorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Axis of the rule. Defaults to `'horizontal'`. */
  orientation?: SeparatorOrientation;
  /**
   * When `true` the separator is purely decorative (`role="none"`) and is not
   * announced. Defaults to `false` (`role="separator"`).
   */
  decorative?: boolean;
}

const c = cssVars.comp.separator;
const STROKE_WIDTH = toPx(tokens.comp.separator.thickness);
/** Cross-axis length of the rule's box, so the jittered line has room to bow. */
const THICKNESS = STROKE_WIDTH * 3;

/**
 * A hand-drawn separator (divider). Draws a single sketchy line
 * (`@ghds/sketch-core`) along its main axis. Exposed as `role="separator"` with
 * `aria-orientation` (or `role="none"` when `decorative`). Colour and thickness
 * come from `@ghds/tokens` (`comp.separator.*`); the SVG is decorative
 * (`aria-hidden`).
 */
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = 'horizontal', decorative = false, style, ...rest },
  forwardedRef,
) {
  const vertical = orientation === 'vertical';
  const {
    ref: sketchRef,
    size,
    seed,
  } = useSketch<HTMLDivElement>({
    roughness: tokens.sys.sketch.roughness,
    bowing: tokens.sys.sketch.bowing,
  });

  const drawable = useMemo<SketchDrawable | null>(() => {
    const { width, height } = size;
    if (width <= 0 || height <= 0) {
      return null;
    }
    const options = {
      roughness: tokens.sys.sketch.roughness,
      bowing: tokens.sys.sketch.bowing,
      seed,
    };
    return vertical
      ? line(width / 2, 0, width / 2, height, options)
      : line(0, height / 2, width, height / 2, options);
  }, [size, vertical, seed]);

  const ref = mergeRefs(sketchRef, forwardedRef);

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    boxSizing: 'border-box',
    flexShrink: 0,
    ...(vertical
      ? {
          display: 'inline-block',
          width: THICKNESS,
          height: '100%',
          minHeight: THICKNESS * 4,
          alignSelf: 'stretch',
        }
      : { display: 'block', width: '100%', height: THICKNESS }),
    ...style,
  };

  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: role is `separator` unless decorative; aria-orientation is only set for that role (biome can't narrow the ternary role)
    <div
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      style={rootStyle}
      {...rest}
    >
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.color}
        strokeWidth={STROKE_WIDTH}
      />
    </div>
  );
});
