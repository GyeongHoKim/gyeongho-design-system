import { offset } from '../geometry/offset.js';
import { serialize } from '../serialize.js';
import type { Op, Point, SketchOptions } from '../types.js';
import { DEFAULT_HACHURE_GAP, hachureSegments } from './hachure.js';

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
 * Stippled fill: a jittered grid of small dots. It reuses the shared
 * {@link hachureSegments} scan — so it honours `hachureAngle` exactly like
 * hachure/cross-hatch/zigzag, and hollows holes via the same even-odd rule —
 * then places dots along each returned span instead of stroking it. Spacing
 * comes from `hachureGap`; each dot is a tiny circle the renderer fills or
 * strokes. Centres are lightly jittered so the grid reads as hand-placed.
 */
export function dots(contours: Point[][], o: SketchOptions, rng: () => number): string[] {
  const gap = Math.max(o.hachureGap ?? DEFAULT_HACHURE_GAP, 0.1);
  const r = Math.max(gap / 4, 0.5);

  const paths: string[] = [];
  for (const s of hachureSegments(contours, o)) {
    const dx = s.x2 - s.x1;
    const dy = s.y2 - s.y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) {
      continue;
    }
    // Walk the span, dropping a dot every `gap` (matching the row spacing).
    for (let d = gap / 2; d < len; d += gap) {
      const t = d / len;
      const cx = s.x1 + dx * t + offset(r, rng, 1);
      const cy = s.y1 + dy * t + offset(r, rng, 1);
      paths.push(dotPath(cx, cy, r));
    }
  }
  return paths;
}
