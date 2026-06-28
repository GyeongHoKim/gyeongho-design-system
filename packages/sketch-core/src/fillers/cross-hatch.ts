import type { Point, SketchOptions } from '../types.js';
import { DEFAULT_HACHURE_ANGLE, hachure } from './hachure.js';

/** Hachure run twice, the second pass rotated 90° — a woven pencil-shade look. */
export function crossHatch(points: Point[], o: SketchOptions, rng: () => number): string[] {
  const first = hachure(points, o, rng);
  const angle = (o.hachureAngle ?? DEFAULT_HACHURE_ANGLE) + 90;
  const second = hachure(points, { ...o, hachureAngle: angle }, rng);
  return [...first, ...second];
}
