import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes, useEffect, useRef } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Current value. Omit for an indeterminate bar. */
  value?: number;
  /** Maximum value. Defaults to `100`. */
  max?: number;
  /** Accessible label describing what is progressing. */
  label?: string;
}

const progress = tokens.comp.progress;
const c = cssVars.comp.progress;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const TRACK_HEIGHT = toPx(tokens.comp.progress.track.height);
const DURATION_MS = Number.parseFloat(progress.duration);
/** Width of the sweeping segment while indeterminate. */
const INDETERMINATE_SEGMENT = '40%';

/**
 * A hand-drawn progress bar. The rail and fill are sketchy rectangles from
 * `@ghds/sketch-core`; every colour, height and sketch parameter comes from
 * `@ghds/tokens` (`comp.progress.*`). Pass a `value` for a determinate bar, or
 * omit it for an indeterminate sweep (suppressed under
 * `prefers-reduced-motion: reduce`).
 *
 * Exposed as `role="progressbar"` with the appropriate `aria-value*`.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, label, style, ...rest },
  forwardedRef,
) {
  // A `NaN` value (e.g. `loaded / total` with `total === 0`) is treated as
  // indeterminate — matching `<gh-progress>` — rather than rendering an invalid
  // `NaN%` width and `aria-valuenow="NaN"`.
  const indeterminate = value === undefined || Number.isNaN(value);
  const percent = indeterminate ? 0 : Math.min(1, Math.max(0, value / max));

  const {
    ref: railRef,
    drawable: railDrawable,
    size: railSize,
  } = useSketch<HTMLDivElement>({
    roughness: progress.sketch.roughness,
    bowing: progress.sketch.bowing,
    fillStyle: 'solid',
    inset: INSET,
  });

  const {
    ref: fillRef,
    drawable: fillDrawable,
    size: fillSize,
  } = useSketch<HTMLDivElement>({
    roughness: progress.sketch.roughness,
    bowing: progress.sketch.bowing,
    fillStyle: 'solid',
    inset: INSET,
  });

  const rootRef = mergeRefs(railRef, forwardedRef);
  const fillWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!indeterminate) {
      return;
    }
    const el = fillWrapperRef.current;
    if (!el || typeof el.animate !== 'function') {
      return;
    }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      return;
    }
    const animation = el.animate(
      [{ transform: 'translateX(-100%)' }, { transform: 'translateX(250%)' }],
      { duration: DURATION_MS * 3, iterations: Number.POSITIVE_INFINITY, easing: 'ease-in-out' },
    );
    return () => animation.cancel();
  }, [indeterminate]);

  const trackStyle: CSSProperties = {
    ...sketchHostStyle,
    position: 'relative',
    boxSizing: 'border-box',
    width: '100%',
    height: TRACK_HEIGHT,
    borderRadius: progress.radius,
    overflow: 'hidden',
    ...style,
  };

  const fillWrapperStyle: CSSProperties = {
    ...sketchHostStyle,
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: indeterminate ? INDETERMINATE_SEGMENT : `${percent * 100}%`,
    borderRadius: progress.radius,
    overflow: 'hidden',
  };

  return (
    <div
      ref={rootRef}
      role="progressbar"
      aria-label={label}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : max}
      aria-valuenow={indeterminate ? undefined : value}
      style={trackStyle}
      {...rest}
    >
      <SketchSurface
        drawable={railDrawable}
        width={railSize.width}
        height={railSize.height}
        strokeColor={c.stroke.rail}
        strokeWidth={STROKE_WIDTH}
        fillColor={c.bg.rail}
        fillRendering="fill"
      />
      <div ref={fillWrapperRef} style={fillWrapperStyle}>
        <div ref={fillRef} style={{ width: '100%', height: '100%' }}>
          <SketchSurface
            drawable={fillDrawable}
            width={fillSize.width}
            height={fillSize.height}
            strokeColor={c.stroke.fill}
            strokeWidth={STROKE_WIDTH}
            fillColor={c.bg.fill}
            fillRendering="fill"
          />
        </div>
      </div>
    </div>
  );
});
