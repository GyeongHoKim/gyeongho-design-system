import type { Point, SketchOptions } from '../types.js';
import { crossHatch } from './cross-hatch.js';
import { hachure } from './hachure.js';
import { solid } from './solid.js';

/**
 * Dispatch to the right filler for `o.fillStyle`. Returns `[]` (and consumes no
 * randomness) when no fill is requested, so unfilled shapes stay byte-stable.
 */
export function fill(points: Point[], o: SketchOptions, rng: () => number): string[] {
  switch (o.fillStyle) {
    case 'hachure':
      return hachure(points, o, rng);
    case 'cross-hatch':
      return crossHatch(points, o, rng);
    case 'solid':
      return solid(points, o, rng);
    default:
      return [];
  }
}
