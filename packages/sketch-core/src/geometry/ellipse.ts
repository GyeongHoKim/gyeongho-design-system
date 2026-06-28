import { fill } from '../fillers/fill.js';
import { mulberry32 } from '../prng.js';
import { serialize } from '../serialize.js';
import type { Op, Point, SketchDrawable, SketchOptions } from '../types.js';
import { isElevated, offsetPoints, shadowRng } from './elevation.js';
import { offset } from './offset.js';

/** Ramanujan I perimeter approximation — used to scale the sample count. */
function perimeter(rx: number, ry: number): number {
  return Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
}

/** Un-jittered ellipse sample ring — the base shared by every pass. */
function baseRing(cx: number, cy: number, rx: number, ry: number, n: number): Point[] {
  const pts: Point[] = [];
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    const a = i * step;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}

/** Add per-pass jitter onto the shared base ring (`jitter === 0` ⇒ the base). */
function jitteredRing(base: Point[], o: SketchOptions, rng: () => number, jitter: number): Point[] {
  if (jitter === 0) {
    return base;
  }
  return base.map(([bx, by]) => [
    bx + offset(o.roughness, rng, 1) * jitter,
    by + offset(o.roughness, rng, 1) * jitter,
  ]);
}

/** Closed Catmull-Rom (tension 0) through the points, emitted as cubic Béziers. */
function closedCurve(pts: Point[]): Op[] {
  const n = pts.length;
  const start = pts[0];
  if (n < 3 || !start) {
    return [];
  }
  const ops: Op[] = [{ op: 'move', data: [start[0], start[1]] }];
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n];
    const b = pts[i];
    const c = pts[(i + 1) % n];
    const d = pts[(i + 2) % n];
    if (!a || !b || !c || !d) {
      continue;
    }
    ops.push({
      op: 'bcurveTo',
      data: [
        b[0] + (c[0] - a[0]) / 6,
        b[1] + (c[1] - a[1]) / 6,
        c[0] - (d[0] - b[0]) / 6,
        c[1] - (d[1] - b[1]) / 6,
        c[0],
        c[1],
      ],
    });
  }
  return ops;
}

/**
 * A sketchy ellipse inscribed in the box (x, y, w, h). The outline is two
 * jittered passes of a smooth closed curve (double-stroke); the second pass is
 * tighter so the strokes nearly meet. Fill uses the *un-jittered* base ring so
 * hachure stays inside the visible outline. The base ring's trig is computed
 * once and shared by all three passes.
 */
export function ellipse(
  x: number,
  y: number,
  w: number,
  h: number,
  o: SketchOptions,
): SketchDrawable {
  const rng = mulberry32(o.seed);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = w / 2;
  const ry = h / 2;

  // Scale sample count with perimeter; floor at 9 so small circles stay round.
  const n = Math.max(Math.floor(perimeter(rx, ry) / 8), 9);
  const base = baseRing(cx, cy, rx, ry, n);

  const strokePaths = [
    serialize(closedCurve(jitteredRing(base, o, rng, 1))),
    serialize(closedCurve(jitteredRing(base, o, rng, 0.5))),
  ];

  const fillPaths = fill(jitteredRing(base, o, rng, 0), o, rng);

  if (isElevated(o)) {
    // Offset ring + its own PRNG stream → drop shadow that never disturbs the
    // foreground passes above. Two passes mirror the double-stroke outline.
    const srng = shadowRng(o.seed);
    const shifted = offsetPoints(base, o.elevation ?? 0);
    const shadowPaths = [
      serialize(closedCurve(jitteredRing(shifted, o, srng, 1))),
      serialize(closedCurve(jitteredRing(shifted, o, srng, 0.5))),
    ];
    return { strokePaths, fillPaths, shadowPaths };
  }
  return { strokePaths, fillPaths };
}
