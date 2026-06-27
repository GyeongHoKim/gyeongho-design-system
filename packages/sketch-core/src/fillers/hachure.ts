import { doubleLinePaths } from '../geometry/double-line.js';
import type { Point, SketchOptions } from '../types.js';

/**
 * Algorithmic fallbacks for when the renderer does not supply token-derived
 * values. Renderers SHOULD pass `hachureGap`/`hachureAngle` from `@ghds/tokens`;
 * these constants only keep the engine functional in isolation (e.g. tests).
 */
export const DEFAULT_HACHURE_GAP = 4;
export const DEFAULT_HACHURE_ANGLE = -41;

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Rotate `p` about `center` by an angle given as a precomputed (cos, sin). */
function rotate(p: Point, center: Point, cos: number, sin: number): Point {
  const dx = p[0] - center[0];
  const dy = p[1] - center[1];
  return [center[0] + dx * cos - dy * sin, center[1] + dx * sin + dy * cos];
}

/**
 * Even-odd scan-line polygon fill, rotated to `hachureAngle`. Returns the raw
 * (un-jittered) fill segments — geometry only, so it is cheap to unit-test.
 */
export function hachureSegments(points: Point[], o: SketchOptions): Segment[] {
  if (points.length < 3) {
    return [];
  }
  const gap = Math.max(o.hachureGap ?? DEFAULT_HACHURE_GAP, 0.1);
  const angle = ((o.hachureAngle ?? DEFAULT_HACHURE_ANGLE) * Math.PI) / 180;

  // Trig is loop-invariant: compute it once for the forward rotation (-angle,
  // making scan lines horizontal) and the inverse rotation (+angle, back).
  const cosFwd = Math.cos(-angle);
  const sinFwd = Math.sin(-angle);
  const cosInv = Math.cos(angle);
  const sinInv = Math.sin(angle);

  let cx = 0;
  let cy = 0;
  for (const p of points) {
    cx += p[0];
    cy += p[1];
  }
  const center: Point = [cx / points.length, cy / points.length];

  // Rotate so hachure lines become horizontal scan lines.
  const rotated = points.map((p) => rotate(p, center, cosFwd, sinFwd));

  let yMin = Number.POSITIVE_INFINITY;
  let yMax = Number.NEGATIVE_INFINITY;
  for (const p of rotated) {
    yMin = Math.min(yMin, p[1]);
    yMax = Math.max(yMax, p[1]);
  }

  const segments: Segment[] = [];
  for (let y = yMin + gap / 2; y < yMax; y += gap) {
    const xs: number[] = [];
    for (let i = 0; i < rotated.length; i++) {
      const p = rotated[i];
      const q = rotated[(i + 1) % rotated.length];
      if (!p || !q) {
        continue;
      }
      // Half-open test avoids double-counting shared vertices / horizontal edges.
      if ((p[1] <= y && q[1] > y) || (q[1] <= y && p[1] > y)) {
        const t = (y - p[1]) / (q[1] - p[1]);
        xs.push(p[0] + t * (q[0] - p[0]));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = xs[k];
      const xb = xs[k + 1];
      if (xa === undefined || xb === undefined) {
        continue;
      }
      const a = rotate([xa, y], center, cosInv, sinInv);
      const b = rotate([xb, y], center, cosInv, sinInv);
      segments.push({ x1: a[0], y1: a[1], x2: b[0], y2: b[1] });
    }
  }
  return segments;
}

/** Hachure fill as sketchy path `d` strings (each segment double-stroked). */
export function hachure(points: Point[], o: SketchOptions, rng: () => number): string[] {
  const paths: string[] = [];
  for (const s of hachureSegments(points, o)) {
    paths.push(...doubleLinePaths(s.x1, s.y1, s.x2, s.y2, o, rng));
  }
  return paths;
}
