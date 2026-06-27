import { mulberry32 } from '../prng.js';
import type { SketchDrawable, SketchOptions } from '../types.js';
import { doubleLinePaths } from './double-line.js';

/** A single sketchy line segment. Produces strokes only (no fill). */
export function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  o: SketchOptions,
): SketchDrawable {
  const rng = mulberry32(o.seed);
  return { strokePaths: doubleLinePaths(x1, y1, x2, y2, o, rng), fillPaths: [] };
}
