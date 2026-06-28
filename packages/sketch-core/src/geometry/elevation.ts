import { mulberry32 } from '../prng.js';
import type { Point, SketchOptions } from '../types.js';

/**
 * Elevation as pure IR: a second, offset copy of a shape's outline drawn behind
 * it to fake a hand-drawn drop shadow. No platform shadow API, no color — the
 * renderer draws {@link SketchDrawable.shadowPaths} in a muted/token color
 * behind the main strokes. The shadow is offset down-right by `o.elevation` px
 * (the conventional light-from-top-left direction).
 *
 * The shadow uses an **independent PRNG stream** derived from `o.seed`, so
 * turning elevation on or off never perturbs the foreground shape's own random
 * sequence — a flat shape and its elevated twin share byte-identical
 * `strokePaths`. The XOR constant is the golden-ratio hash used elsewhere as a
 * cheap, well-distributed seed mixer.
 */
const SHADOW_SEED_XOR = 0x9e3779b9;

/** True when `o` requests a (positive) elevation shadow. */
export function isElevated(o: SketchOptions): boolean {
  return typeof o.elevation === 'number' && o.elevation > 0;
}

/** The shadow layer's own seeded PRNG, decoupled from the foreground stream. */
export function shadowRng(seed: number): () => number {
  return mulberry32((seed ^ SHADOW_SEED_XOR) >>> 0);
}

/** Offset every point down-right by `d` px (the drop-shadow displacement). */
export function offsetPoints(points: Point[], d: number): Point[] {
  return points.map(([x, y]) => [x + d, y + d] as Point);
}
