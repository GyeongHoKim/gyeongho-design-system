import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes, useRef } from 'react';
import { useLoopingAnimation } from '../hooks/useLoopingAnimation.js';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Rendered diameter of a {@link Spinner}. */
export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Rendered diameter. Defaults to `'md'`. */
  size?: SpinnerSize;
  /** Accessible label for the busy state. Defaults to `'Loading'`. */
  label?: string;
}

const spinner = tokens.comp.spinner;
const c = cssVars.comp.spinner;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const SPIN_DURATION_MS = Number.parseFloat(spinner.duration);

/**
 * A hand-drawn loading spinner: a sketchy ellipse ring (`@ghds/sketch-core`)
 * that rotates. The wobble of the hand-drawn outline makes the rotation
 * legible. Every colour, size and the spin duration come from `@ghds/tokens`
 * (`comp.spinner.*`). Rotation is driven by the Web Animations API and is
 * automatically suppressed under `prefers-reduced-motion: reduce`.
 *
 * Exposed as `role="status"` with an accessible label so assistive tech
 * announces the busy state.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', label = 'Loading', style, ...rest },
  forwardedRef,
) {
  const {
    ref: sketchRef,
    drawable,
    size: measured,
  } = useSketch<HTMLSpanElement>({
    shape: 'ellipse',
    roughness: spinner.sketch.roughness,
    bowing: spinner.sketch.bowing,
    inset: INSET,
  });

  const hostRef = useRef<HTMLSpanElement>(null);
  const ref = mergeRefs(sketchRef, hostRef, forwardedRef);

  useLoopingAnimation(hostRef, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
    durationMs: SPIN_DURATION_MS,
  });

  const dimension = spinner.size[size];

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-block',
    boxSizing: 'border-box',
    width: dimension,
    height: dimension,
    flexShrink: 0,
    ...style,
  };

  return (
    <span ref={ref} role="status" aria-label={label} style={rootStyle} {...rest}>
      <SketchSurface
        drawable={drawable}
        width={measured.width}
        height={measured.height}
        strokeColor={c.indicator}
        strokeWidth={STROKE_WIDTH}
      />
    </span>
  );
});
