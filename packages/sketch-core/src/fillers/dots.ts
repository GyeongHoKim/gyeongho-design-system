import { offset } from '../geometry/offset.js';
import { serialize } from '../serialize.js';
import type { Op, Point, SketchOptions } from '../types.js';
import { DEFAULT_HACHURE_GAP } from './hachure.js';

/** Bézier circle constant: control-arm length for a quarter-circle ≈ r·4(√2−1)/3. */
const KAPPA = 0.5522847498;

/** A small closed circle as four cubic Béziers, centred at `(cx, cy)`. */
function dotPath(cx: number, cy: number, r: number): string {
  const k = r * KAPPA;
  const ops: Op[] = [
    { op: 'move', data: [cx + r, cy] },
    { op: 'bcurveTo', data: [cx + r, cy + k, cx + k, cy + r, cx, cy + r] },
    { op: 'bcurveTo', data: [cx - k, cy + r, cx - r, cy + k, cx - r, cy] },
    { op: 'bcurveTo', data: [cx - r, cy - k, cx - k, cy - r, cx, cy - r] },
    { op: 'bcurveTo', data: [cx + k, cy - r, cx + r, cy - k, cx + r, cy] },
  ];
  return serialize(ops);
}

/**
 * Stippled fill: a jittered grid of small dots clipped to the polygon via the
 * same even-odd scan-line test the hachure filler uses (axis-aligned here, so
 * `hachureAngle` does not apply). Spacing comes from `hachureGap`; each dot is a
 * tiny circle the renderer fills or strokes with a token color. Centres are
 * lightly jittered so the grid reads as hand-placed rather than mechanical.
 */
export function dots(points: Point[], o: SketchOptions, rng: () => number): string[] {
  if (points.length < 3) {
    return [];
  }
  const gap = Math.max(o.hachureGap ?? DEFAULT_HACHURE_GAP, 0.1);
  const r = Math.max(gap / 4, 0.5);

  let yMin = Number.POSITIVE_INFINITY;
  let yMax = Number.NEGATIVE_INFINITY;
  for (const p of points) {
    yMin = Math.min(yMin, p[1]);
    yMax = Math.max(yMax, p[1]);
  }

  const paths: string[] = [];
  for (let y = yMin + gap / 2; y < yMax; y += gap) {
    const xs: number[] = [];
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const q = points[(i + 1) % points.length];
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
      for (let x = xa + gap / 2; x < xb; x += gap) {
        const cx = x + offset(r, rng, 1);
        const cy = y + offset(r, rng, 1);
        paths.push(dotPath(cx, cy, r));
      }
    }
  }
  return paths;
}
