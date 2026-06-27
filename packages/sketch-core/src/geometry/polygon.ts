import { fill } from '../fillers/fill.js';
import { mulberry32 } from '../prng.js';
import type { Point, SketchDrawable, SketchOptions } from '../types.js';
import { doubleLinePaths } from './double-line.js';

/**
 * A sketchy closed polygon: each consecutive edge (closing back to the first
 * point) is double-stroked, then the interior is filled per `o.fillStyle`. The
 * general case that {@link rectangle} delegates to.
 */
export function polygon(points: Point[], o: SketchOptions): SketchDrawable {
  const rng = mulberry32(o.seed);

  const strokePaths: string[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (!a || !b) {
      continue;
    }
    strokePaths.push(...doubleLinePaths(a[0], a[1], b[0], b[1], o, rng));
  }

  // Stroke first, then fill — both share the one rng so the shape is stable.
  const fillPaths = fill(points, o, rng);
  return { strokePaths, fillPaths };
}
