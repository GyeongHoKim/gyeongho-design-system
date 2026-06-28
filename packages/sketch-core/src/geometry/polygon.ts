import { fill } from '../fillers/fill.js';
import { mulberry32 } from '../prng.js';
import type { Point, SketchDrawable, SketchOptions } from '../types.js';
import { polylinePaths } from './double-line.js';
import { isElevated, offsetPoints, shadowRng } from './elevation.js';

/**
 * A sketchy closed polygon: each consecutive edge (closing back to the first
 * point) is double-stroked, then the interior is filled per `o.fillStyle`. The
 * general case that {@link rectangle} delegates to. When `o.elevation > 0`, an
 * offset copy of the outline is emitted as `shadowPaths`.
 */
export function polygon(points: Point[], o: SketchOptions): SketchDrawable {
  const rng = mulberry32(o.seed);

  const strokePaths = polylinePaths(points, true, o, rng);

  // Stroke first, then fill — both share the one rng so the shape is stable.
  const fillPaths = fill(points, o, rng);

  if (isElevated(o)) {
    const shifted = offsetPoints(points, o.elevation ?? 0);
    const shadowPaths = polylinePaths(shifted, true, o, shadowRng(o.seed));
    return { strokePaths, fillPaths, shadowPaths };
  }
  return { strokePaths, fillPaths };
}
