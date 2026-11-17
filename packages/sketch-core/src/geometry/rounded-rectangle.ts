import type { SketchDrawable, SketchOptions } from '../types.js';
import { path } from './path.js';
import { rectangle } from './rectangle.js';

/**
 * A sketchy rectangle with circular-arc corners of radius `r`.
 *
 * - `r` is clamped to half the shorter side, so a pill radius (e.g. a
 *   `9999px` token) draws semicircular ends and a square box becomes a circle.
 * - `r <= 0` (or `NaN`) returns {@link rectangle}'s output unchanged, so a
 *   square-cornered caller stays byte-identical.
 * - Otherwise the outline is built as a closed SVG `d` string (straight edges
 *   joined by `A` arcs) and handed to {@link path}, which flattens the arcs and
 *   applies the same double-stroke, fill and elevation as every other shape.
 *
 * Arc flattening uses `Math.cos/sin`, so like `ellipse` the output is
 * byte-identical for a given seed only within the same JS engine.
 */
export function roundedRectangle(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  o: SketchOptions,
): SketchDrawable {
  const rr = Math.min(r, w / 2, h / 2);
  if (!(rr > 0)) {
    return rectangle(x, y, w, h, o);
  }
  const right = x + w;
  const bottom = y + h;
  const arc = (ex: number, ey: number): string => `A ${rr} ${rr} 0 0 1 ${ex} ${ey}`;
  const d = [
    `M ${x + rr} ${y}`,
    `H ${right - rr}`,
    arc(right, y + rr),
    `V ${bottom - rr}`,
    arc(right - rr, bottom),
    `H ${x + rr}`,
    arc(x, bottom - rr),
    `V ${y + rr}`,
    arc(x + rr, y),
    'Z',
  ].join(' ');
  return path(d, o);
}
