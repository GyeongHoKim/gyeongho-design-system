import { forcedSeed, rectangle, type SketchDrawable, type SketchOptions } from '@ghds/sketch-core';

/** Measured pixel size of a component, supplied by `onLayout`. */
export interface Size {
  width: number;
  height: number;
}

/**
 * Geometry + sketch parameters for one outline. Every numeric value here is a
 * design value sourced from `@ghds/tokens` by the calling component — this
 * module only assembles them into a {@link SketchOptions} object.
 */
export interface SketchParams {
  /** Point-jitter magnitude (`sketch.roughness` token). */
  roughness: number;
  /** Edge bowing (`sketch.bowing` token). */
  bowing: number;
  /** Deterministic PRNG seed — stable per component instance. */
  seed: number;
  /** Fill strategy for the closed shape. Omit for an unfilled outline. */
  fillStyle?: SketchOptions['fillStyle'];
  /** Gap between fill lines (`sketch.hachureGap` token). */
  hachureGap?: number;
  /** Hachure angle in degrees (`sketch.hachureAngle` token). */
  hachureAngle?: number;
  /** Drop-shadow offset in px expressing elevation. Omit/0 ⇒ flat. */
  elevation?: number;
}

/** Below this, a measured edge is too small to sketch meaningfully. */
const MIN_DIMENSION = 1;

/**
 * Build the sketchy rectangle outline for a measured component.
 *
 * The rectangle is inset by `inset` px on every side so the (token-driven)
 * stroke width is not clipped at the component's bounds. Returns `null` when
 * the component has not been measured yet (or is degenerate), so the renderer
 * can skip drawing until a real size arrives from `onLayout`.
 */
export function buildRectangleOutline(
  size: Size,
  inset: number,
  params: SketchParams,
): SketchDrawable | null {
  const width = size.width - inset * 2;
  const height = size.height - inset * 2;
  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    return null;
  }

  const options: SketchOptions = {
    roughness: params.roughness,
    bowing: params.bowing,
    seed: params.seed,
  };
  if (params.fillStyle) {
    options.fillStyle = params.fillStyle;
  }
  if (params.hachureGap !== undefined) {
    options.hachureGap = params.hachureGap;
  }
  if (params.hachureAngle !== undefined) {
    options.hachureAngle = params.hachureAngle;
  }
  if (params.elevation !== undefined && params.elevation > 0) {
    options.elevation = params.elevation;
  }

  return rectangle(inset, inset, width, height, options);
}

let seedCounter = 0;

/**
 * Generate one PRNG seed for a component instance. The renderer (not the
 * geometry core) owns seed creation; sketch-core then derives every random
 * decision deterministically from it, so re-renders never re-roll the look.
 * The counter disambiguates instances mounted within the same millisecond.
 *
 * When a host has pinned a seed (via `setForcedSeed`, e.g. Storybook under
 * Chromatic) that value is returned instead, making snapshots deterministic.
 */
export function makeSeed(): number {
  const forced = forcedSeed();
  if (forced !== null) {
    return forced;
  }
  seedCounter = (seedCounter + 1) >>> 0;
  const entropy = Math.floor(Math.random() * 0xffffffff);
  return (entropy ^ (Date.now() + seedCounter)) >>> 0;
}
