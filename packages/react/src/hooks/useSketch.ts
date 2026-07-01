import {
  ellipse,
  forcedSeed,
  rectangle,
  type SketchDrawable,
  type SketchOptions,
} from '@ghds/sketch-core';
import { useCallback, useMemo, useRef, useState } from 'react';

/** Which sketch-core primitive to draw around the measured box. */
export type SketchShape = 'rectangle' | 'ellipse';

/**
 * Inputs to {@link useSketch}. Every numeric here is a *design value* and must
 * originate from `@ghds/tokens` (`sys.sketch.*` / `comp.*.sketch.*`) — the hook
 * never invents them. See the root Code Quality Gate.
 */
export interface UseSketchParams {
  /** Primitive to draw. Defaults to `'rectangle'`. */
  shape?: SketchShape;
  /** Point-jitter magnitude. From `tokens.sys.sketch.roughness` (or comp). */
  roughness: number;
  /** Edge bowing. From `tokens.sys.sketch.bowing` (or comp). */
  bowing: number;
  /** Fill strategy. Omit for an outline-only shape. */
  fillStyle?: SketchOptions['fillStyle'];
  /** Gap between fill lines/dots. From `tokens.sys.sketch.hachureGap`. */
  hachureGap?: number;
  /** Hachure angle (deg). From `tokens.sys.sketch.hachureAngle`. */
  hachureAngle?: number;
  /**
   * Inset (px) applied to all four sides so the jittered stroke is not clipped
   * at the element's border box. Derived from a border-width token by callers.
   */
  inset?: number;
}

/** The measured border-box size of the observed element. */
export interface SketchSize {
  readonly width: number;
  readonly height: number;
}

/** Return value of {@link useSketch}. */
export interface UseSketchResult<E extends Element> {
  /** Attach to the element whose size drives the geometry. */
  readonly ref: (node: E | null) => void;
  /** The generated IR, or `null` before the element has a non-zero size. */
  readonly drawable: SketchDrawable | null;
  /** Latest measured size. */
  readonly size: SketchSize;
  /** The stable per-instance PRNG seed (exposed for debugging/tests). */
  readonly seed: number;
}

/** A positive 31-bit seed, or the host-pinned seed when one is set (snapshots). */
function randomSeed(): number {
  return forcedSeed() ?? Math.floor(Math.random() * 0x7fffffff) + 1;
}

/**
 * Measure an element and turn its size into deterministic hand-drawn geometry.
 *
 * - The `seed` is fixed **once per component instance** with `useMemo`, so any
 *   re-render (hover, focus, value, theme) reuses the exact same geometry — no
 *   shimmering. New geometry is generated **only** when the measured size or a
 *   sketch parameter changes.
 * - Sizing uses a `ResizeObserver` on the border box; geometry is `null` until
 *   a non-zero size is known (SSR/first paint render nothing, so no hydration
 *   mismatch from the random seed).
 * - All style (color/stroke width) is applied by the renderer from tokens — the
 *   hook only produces colorless path `d` strings via `@ghds/sketch-core`.
 */
export function useSketch<E extends Element = HTMLElement>(
  params: UseSketchParams,
): UseSketchResult<E> {
  const {
    shape = 'rectangle',
    roughness,
    bowing,
    fillStyle,
    hachureGap,
    hachureAngle,
    inset = 0,
  } = params;

  const seed = useMemo(randomSeed, []);
  const [size, setSize] = useState<SketchSize>({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: E | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (node === null || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const border = entry.borderBoxSize?.[0];
      const width = border ? border.inlineSize : entry.contentRect.width;
      const height = border ? border.blockSize : entry.contentRect.height;
      setSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    });
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  const drawable = useMemo<SketchDrawable | null>(() => {
    const { width, height } = size;
    if (width <= 0 || height <= 0) {
      return null;
    }
    const options: SketchOptions = {
      roughness,
      bowing,
      seed,
      fillStyle,
      hachureGap,
      hachureAngle,
    };
    const w = Math.max(1, width - inset * 2);
    const h = Math.max(1, height - inset * 2);
    const draw = shape === 'ellipse' ? ellipse : rectangle;
    return draw(inset, inset, w, h, options);
  }, [size, shape, roughness, bowing, seed, fillStyle, hachureGap, hachureAngle, inset]);

  return { ref, drawable, size, seed };
}
