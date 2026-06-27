import { offset } from '../geometry/offset.js';
import { serialize } from '../serialize.js';
import type { Op, Point, SketchOptions } from '../types.js';

/**
 * A single, lightly-jittered closed outline the renderer fills with a flat
 * token color (hand-cut-paper edge rather than a perfectly clean one).
 */
export function solid(points: Point[], o: SketchOptions, rng: () => number): string[] {
  const first = points[0];
  if (points.length < 2 || !first) {
    return [];
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
  return [serialize(ops)];
}
