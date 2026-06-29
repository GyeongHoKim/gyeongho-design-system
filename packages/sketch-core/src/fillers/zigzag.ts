import { doubleLinePaths } from '../geometry/double-line.js';
import type { Point, SketchOptions } from '../types.js';
import { DEFAULT_HACHURE_GAP, hachureSegments, isPointInContours } from './hachure.js';

/**
 * Each fill scan line is redrawn as a triangle wave instead of a straight line,
 * giving a denser "scribbled" pencil-shade. Wavelength and amplitude both derive
 * from `hachureGap`, so the texture stays coherent with the line spacing and
 * introduces no new design knob — the renderer still only feeds the one
 * `hachureGap` token. Every wave edge is double-stroked like the rest of the
 * engine, so the fill is sketchy too.
 *
 * Like hachure/ellipse, the fill must stay **inside the outline**. Each wave
 * peak swings perpendicular to the scan line, which can poke past a slanted or
 * curved boundary, so any peak that falls outside the even-odd region is clamped
 * back onto the scan line (which is guaranteed inside between its crossings).
 */
export function zigzag(contours: Point[][], o: SketchOptions, rng: () => number): string[] {
  const gap = Math.max(o.hachureGap ?? DEFAULT_HACHURE_GAP, 0.1);
  const step = gap; // one wave per scan-line gap → coherent grid
  const amp = gap / 2; // peaks sit halfway between neighbouring scan lines

  const paths: string[] = [];
  for (const s of hachureSegments(contours, o)) {
    const dx = s.x2 - s.x1;
    const dy = s.y2 - s.y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) {
      continue;
    }
    // Unit perpendicular to the scan line — the direction the wave swings.
    const px = -dy / len;
    const py = dx / len;
    const waves = Math.max(1, Math.round(len / step));

    let prev: Point = [s.x1, s.y1];
    for (let i = 1; i <= waves; i++) {
      const t = i / waves;
      // The base point sits on the scan line (inside the span by construction).
      const bx = s.x1 + dx * t;
      const by = s.y1 + dy * t;
      // Alternate the swing each step; land exactly on the end point (no offset)
      // so the wave closes flush with the polygon edge.
      const swing = i === waves ? 0 : i % 2 === 1 ? amp : -amp;
      let cur: Point = [bx + px * swing, by + py * swing];
      // Containment: if the swung peak leaves the outline, drop back to the base
      // point on the scan line, which is inside the span.
      if (swing !== 0 && !isPointInContours(cur, contours)) {
        cur = [bx, by];
      }
      paths.push(...doubleLinePaths(prev[0], prev[1], cur[0], cur[1], o, rng));
      prev = cur;
    }
  }
  return paths;
}
