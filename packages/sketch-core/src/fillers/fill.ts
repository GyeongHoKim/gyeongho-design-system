import type { Point, SketchOptions } from '../types.js';
import { crossHatch } from './cross-hatch.js';
import { dots } from './dots.js';
import { hachure } from './hachure.js';
import { solid } from './solid.js';
import { zigzag } from './zigzag.js';

/**
 * Dispatch to the right filler for `o.fillStyle`. Takes a list of **contours**
 * (the outer ring plus any inner holes) so compound shapes fill with the
 * even-odd rule — inner contours subtract. Simple shapes pass a single-contour
 * list (`[points]`). Returns `[]` (and consumes no randomness) when no fill is
 * requested, so unfilled shapes stay byte-stable.
 */
export function fill(contours: Point[][], o: SketchOptions, rng: () => number): string[] {
  switch (o.fillStyle) {
    case 'hachure':
      return hachure(contours, o, rng);
    case 'cross-hatch':
      return crossHatch(contours, o, rng);
    case 'solid':
      return solid(contours, o, rng);
    case 'zigzag':
      return zigzag(contours, o, rng);
    case 'dots':
      return dots(contours, o, rng);
    default:
      return [];
  }
}
