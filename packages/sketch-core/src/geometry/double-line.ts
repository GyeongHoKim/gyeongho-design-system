import { serialize } from '../serialize.js';
import type { Op, SketchOptions } from '../types.js';
import { offset, roughnessGain } from './offset.js';

/**
 * One perturbed cubic Bézier approximating the segment (x1,y1)→(x2,y2).
 * `overlay` = the second pass, with smaller jitter so the two strokes nearly
 * meet — the "drawn twice by hand" effect. `len`/`g` are precomputed once per
 * edge by {@link doubleLine}; they are identical across both passes.
 */
function singleStroke(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  o: SketchOptions,
  rng: () => number,
  overlay: boolean,
  len: number,
  g: number,
): Op[] {
  // base jitter; clamp so tiny segments don't explode
  let off = o.roughness * 2;
  if (off * off * 100 > len * len) {
    off = len / 10;
  }
  const half = off / 2;

  // coherent bow, perpendicular to the segment
  const diverge = 0.2 + rng() * 0.2;
  let bowX = (o.bowing * off * (y2 - y1)) / 200;
  let bowY = (o.bowing * off * (x1 - x2)) / 200;
  bowX = offset(bowX, rng, g);
  bowY = offset(bowY, rng, g);

  const k = overlay ? half : off;
  const j = (): number => offset(k, rng, g);

  return [
    { op: 'move', data: [x1 + j(), y1 + j()] },
    {
      op: 'bcurveTo',
      data: [
        bowX + x1 + (x2 - x1) * diverge + j(),
        bowY + y1 + (y2 - y1) * diverge + j(),
        bowX + x1 + (x2 - x1) * 2 * diverge + j(),
        bowY + y1 + (y2 - y1) * 2 * diverge + j(),
        x2 + j(),
        y2 + j(),
      ],
    },
  ];
}

/**
 * The core sketchy stroke: one edge → two perturbed curves. Each returned
 * `Op[]` serializes to its own `d` string (so one edge = two `strokePaths`).
 * `len`/`g` depend only on the endpoints, so they are computed once here and
 * shared by both passes.
 */
export function doubleLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  o: SketchOptions,
  rng: () => number,
): Op[][] {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const g = roughnessGain(len);
  return [
    singleStroke(x1, y1, x2, y2, o, rng, false, len, g),
    singleStroke(x1, y1, x2, y2, o, rng, true, len, g),
  ];
}

/**
 * One edge → its two stroke `d` strings. The single home of the "double-stroke
 * an edge, then serialize each pass" conversion — shared by {@link line},
 * polygon edges, and hachure fill lines so the conversion can never drift.
 */
export function doubleLinePaths(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  o: SketchOptions,
  rng: () => number,
): string[] {
  return doubleLine(x1, y1, x2, y2, o, rng).map((ops) => serialize(ops));
}
