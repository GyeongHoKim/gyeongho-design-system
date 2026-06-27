import { describe, expect, it } from 'vitest';
import type { Point, SketchOptions } from '../types.js';
import { hachureSegments } from './hachure.js';

const square: Point[] = [
  [0, 0],
  [100, 0],
  [100, 100],
  [0, 100],
];

const opts = (over: Partial<SketchOptions>): SketchOptions => ({
  roughness: 0,
  bowing: 0,
  seed: 1,
  ...over,
});

describe('hachureSegments', () => {
  it('fills an axis-aligned square with full-width horizontal lines', () => {
    const segs = hachureSegments(square, opts({ hachureAngle: 0, hachureGap: 10 }));
    expect(segs).toHaveLength(10); // y = 5, 15, …, 95
    for (const s of segs) {
      expect(Math.min(s.x1, s.x2)).toBeCloseTo(0, 5);
      expect(Math.max(s.x1, s.x2)).toBeCloseTo(100, 5);
    }
  });

  it('packs more lines as the gap shrinks', () => {
    const wide = hachureSegments(square, opts({ hachureAngle: 0, hachureGap: 20 }));
    const tight = hachureSegments(square, opts({ hachureAngle: 0, hachureGap: 5 }));
    expect(tight.length).toBeGreaterThan(wide.length);
  });

  it('produces spans of varying width for a triangle', () => {
    const tri: Point[] = [
      [0, 0],
      [100, 0],
      [50, 100],
    ];
    const segs = hachureSegments(tri, opts({ hachureAngle: 0, hachureGap: 10 }));
    const widths = segs.map((s) => Math.abs(s.x2 - s.x1));
    expect(segs.length).toBeGreaterThan(0);
    expect(Math.max(...widths)).toBeGreaterThan(Math.min(...widths));
  });

  it('returns nothing for a degenerate (sub-3-point) polygon', () => {
    expect(
      hachureSegments(
        [
          [0, 0],
          [1, 1],
        ],
        opts({}),
      ),
    ).toEqual([]);
  });
});
