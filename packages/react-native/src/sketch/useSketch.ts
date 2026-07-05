import type { SketchDrawable } from '@ghds/sketch-core';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import {
  buildOutline,
  makeSeed,
  type Size,
  type SketchParams,
  type SketchShape,
} from './options.js';

/** Inputs to {@link useSketch}: token-derived sketch params + the stroke inset. */
export interface UseSketchParams {
  /** Primitive to draw. Defaults to `'rectangle'`. */
  shape?: SketchShape;
  /** Inset (px) so the stroke is not clipped — usually the border width token. */
  inset: number;
  /** Point-jitter magnitude (`sketch.roughness` token). */
  roughness: number;
  /** Edge bowing (`sketch.bowing` token). */
  bowing: number;
  /** Fill strategy for the closed shape. Omit for an unfilled outline. */
  fillStyle?: SketchParams['fillStyle'];
  /** Gap between fill lines (`sketch.hachureGap` token). */
  hachureGap?: number;
  /** Hachure angle in degrees (`sketch.hachureAngle` token). */
  hachureAngle?: number;
  /** Drop-shadow offset in px expressing elevation. Omit/0 ⇒ flat. */
  elevation?: number;
}

/** Output of {@link useSketch}: wire `onLayout` to the host element. */
export interface UseSketchResult {
  /** Pass to the host element's `onLayout` so the hook can measure it. */
  onLayout: (event: LayoutChangeEvent) => void;
  /** Most recent measured size (`{ 0, 0 }` before first layout). */
  size: Size;
  /** Sketchy outline IR for the current size, or `null` before measurement. */
  drawable: SketchDrawable | null;
  /** The instance-stable PRNG seed (exposed for debugging/snapshots). */
  seed: number;
}

/**
 * React adapter for `@ghds/sketch-core`. It is platform-specific only in two
 * ways — it measures with `onLayout` (instead of the web's `ResizeObserver`)
 * and feeds the result to a `react-native-svg` `<Path>` via
 * `SketchBackground`. The call into the geometry core is otherwise identical to
 * the web/React adapter.
 *
 * The seed is fixed once per instance (`useRef`), so hover/focus re-renders do
 * not make the outline shimmer; the outline is regenerated (`useMemo`) only
 * when the measured size or a sketch parameter actually changes.
 */
export function useSketch(params: UseSketchParams): UseSketchResult {
  const {
    shape = 'rectangle',
    inset,
    roughness,
    bowing,
    fillStyle,
    hachureGap,
    hachureAngle,
    elevation,
  } = params;

  const seedRef = useRef<number | null>(null);
  if (seedRef.current === null) {
    seedRef.current = makeSeed();
  }
  const seed = seedRef.current;

  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  const drawable = useMemo(
    () =>
      buildOutline(shape, size, inset, {
        seed,
        roughness,
        bowing,
        fillStyle,
        hachureGap,
        hachureAngle,
        elevation,
      }),
    [shape, size, inset, seed, roughness, bowing, fillStyle, hachureGap, hachureAngle, elevation],
  );

  return { onLayout, size, drawable, seed };
}
