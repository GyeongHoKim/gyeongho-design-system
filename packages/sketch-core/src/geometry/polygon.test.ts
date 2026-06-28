import { describe, expect, it } from 'vitest';
import type { Point, SketchOptions } from '../types.js';
import { polygon } from './polygon.js';

const tri: Point[] = [
  [0, 0],
  [100, 0],
  [50, 80],
];
const base: SketchOptions = { roughness: 1.2, bowing: 1, seed: 5 };

describe('polygon', () => {
  it('emits two stroke paths per edge', () => {
    expect(polygon(tri, base).strokePaths).toHaveLength(6); // 3 edges × 2
  });

  it('has no fill by default', () => {
    expect(polygon(tri, base).fillPaths).toEqual([]);
  });

  it('produces fill paths when fillStyle is hachure', () => {
    const r = polygon(tri, { ...base, fillStyle: 'hachure', hachureGap: 8 });
    expect(r.fillPaths.length).toBeGreaterThan(0);
  });

  it('cross-hatch yields more fill than plain hachure', () => {
    const h = polygon(tri, { ...base, fillStyle: 'hachure', hachureGap: 8 });
    const x = polygon(tri, { ...base, fillStyle: 'cross-hatch', hachureGap: 8 });
    expect(x.fillPaths.length).toBeGreaterThan(h.fillPaths.length);
  });

  it('solid fill is a single path', () => {
    expect(polygon(tri, { ...base, fillStyle: 'solid' }).fillPaths).toHaveLength(1);
  });

  it('is deterministic for a given seed', () => {
    expect(polygon(tri, base)).toEqual(polygon(tri, base));
  });
});
