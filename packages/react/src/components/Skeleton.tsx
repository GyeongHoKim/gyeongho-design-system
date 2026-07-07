import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes, useRef } from 'react';
import { useLoopingAnimation } from '../hooks/useLoopingAnimation.js';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Shape of a {@link Skeleton} placeholder. */
export type SkeletonVariant = 'rect' | 'text' | 'circle';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Placeholder shape. Defaults to `'rect'`. */
  variant?: SkeletonVariant;
  /** Width (number ⇒ px). Defaults to `100%` (or the diameter for `circle`). */
  width?: number | string;
  /** Height (number ⇒ px). Defaults per variant. */
  height?: number | string;
}

const skeleton = tokens.comp.skeleton;
const c = cssVars.comp.skeleton;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const DURATION_MS = Number.parseFloat(skeleton.duration);
const PULSE_MIN = tokens.sys.opacity.disabled;
const RECT_HEIGHT = tokens.sys.spacing.lg;
const TEXT_HEIGHT = tokens.sys.spacing.md;
const CIRCLE_SIZE = tokens.sys.spacing['2xl'];

/**
 * A hand-drawn loading placeholder: a sketchy filled shape (`@ghds/sketch-core`)
 * that gently pulses opacity while content loads. Colours, radius, the pulse
 * duration, and the dimmed opacity all come from `@ghds/tokens`
 * (`comp.skeleton.*` / `sys.opacity.disabled`). The pulse is suppressed under
 * `prefers-reduced-motion: reduce`.
 *
 * Purely decorative (`aria-hidden`) — announce the busy state on the region it
 * replaces (e.g. `aria-busy` on a container), not on each placeholder.
 */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { variant = 'rect', width, height, style, ...rest },
  forwardedRef,
) {
  const isCircle = variant === 'circle';

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLSpanElement>({
    shape: isCircle ? 'ellipse' : 'rectangle',
    roughness: skeleton.sketch.roughness,
    bowing: skeleton.sketch.bowing,
    fillStyle: 'solid',
    inset: INSET,
  });

  const hostRef = useRef<HTMLSpanElement>(null);
  const ref = mergeRefs(sketchRef, hostRef, forwardedRef);

  useLoopingAnimation(hostRef, [{ opacity: 1 }, { opacity: PULSE_MIN }, { opacity: 1 }], {
    durationMs: DURATION_MS * 3,
    easing: 'ease-in-out',
  });

  let resolvedWidth: number | string;
  let resolvedHeight: number | string;
  if (isCircle) {
    const diameter = height ?? width ?? CIRCLE_SIZE;
    resolvedWidth = diameter;
    resolvedHeight = diameter;
  } else {
    resolvedWidth = width ?? '100%';
    resolvedHeight = height ?? (variant === 'text' ? TEXT_HEIGHT : RECT_HEIGHT);
  }
  const radius = isCircle || variant === 'text' ? tokens.sys.radius.pill : skeleton.radius;

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-block',
    boxSizing: 'border-box',
    width: resolvedWidth,
    height: resolvedHeight,
    borderRadius: radius,
    ...style,
  };

  return (
    <span ref={ref} aria-hidden="true" style={rootStyle} {...rest}>
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.stroke}
        strokeWidth={STROKE_WIDTH}
        fillColor={c.bg}
        fillRendering="fill"
      />
    </span>
  );
});
