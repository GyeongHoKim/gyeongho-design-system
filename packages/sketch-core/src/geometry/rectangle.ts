import type { Point, SketchDrawable, SketchOptions } from '../types.js';
import { polygon } from './polygon.js';

/**
 * A sketchy rectangle. Delegates to {@link polygon} with the four corners, so
 * it shares the exact stroke + fill behaviour (8 stroke paths: 4 edges ×
 * double-stroke, plus `fillPaths` when `o.fillStyle` is set).
 */
export function rectangle(
  x: number,
  y: number,
  w: number,
  h: number,
  o: SketchOptions,
): SketchDrawable {
  const corners: Point[] = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  return polygon(corners, o);
}
