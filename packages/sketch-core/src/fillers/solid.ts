import { offset } from '../geometry/offset.js';
import { serialize } from '../serialize.js';
import type { Op, Point, SketchOptions } from '../types.js';

/** One lightly-jittered closed outline (hand-cut-paper edge) for a contour. */
function solidRing(points: Point[], o: SketchOptions, rng: () => number): string | null {
  const first = points[0];
  if (points.length < 2 || !first) {
    return null;
  }
  const j = (): number => offset(o.roughness, rng, 1);

  const ops: Op[] = [{ op: 'move', data: [first[0] + j(), first[1] + j()] }];
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    if (!p) {
      continue;
    }
    ops.push({ op: 'lineTo', data: [p[0] + j(), p[1] + j()] });
  }
  ops.push({ op: 'lineTo', data: [first[0] + j(), first[1] + j()] });
  return serialize(ops);
}

/**
 * A lightly-jittered closed outline per contour the renderer fills with a flat
 * token color. One path per contour means a compound shape (a hole — an `O`,
 * ring, donut) hollows correctly when the renderer fills with the even-odd
 * rule, instead of painting the hole solid.
 */
export function solid(contours: Point[][], o: SketchOptions, rng: () => number): string[] {
  const paths: string[] = [];
  for (const ring of contours) {
    const d = solidRing(ring, o, rng);
    if (d !== null) {
      paths.push(d);
    }
  }
  return paths;
}
