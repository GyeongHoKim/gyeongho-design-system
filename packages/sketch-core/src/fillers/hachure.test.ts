import { describe, expect, it } from 'vitest';
import type { Point, SketchOptions } from '../types.js';
import { hachureSegments, isPointInContours } from './hachure.js';

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
    const segs = hachureSegments([square], opts({ hachureAngle: 0, hachureGap: 10 }));
    expect(segs).toHaveLength(10); // y = 5, 15, …, 95
    for (const s of segs) {
      expect(Math.min(s.x1, s.x2)).toBeCloseTo(0, 5);
      expect(Math.max(s.x1, s.x2)).toBeCloseTo(100, 5);
    }
  });

  it('packs more lines as the gap shrinks', () => {
    const wide = hachureSegments([square], opts({ hachureAngle: 0, hachureGap: 20 }));
    const tight = hachureSegments([square], opts({ hachureAngle: 0, hachureGap: 5 }));
    expect(tight.length).toBeGreaterThan(wide.length);
  });

  it('produces spans of varying width for a triangle', () => {
    const tri: Point[] = [
      [0, 0],
      [100, 0],
      [50, 100],
    ];
    const segs = hachureSegments([tri], opts({ hachureAngle: 0, hachureGap: 10 }));
    const widths = segs.map((s) => Math.abs(s.x2 - s.x1));
    expect(segs.length).toBeGreaterThan(0);
    expect(Math.max(...widths)).toBeGreaterThan(Math.min(...widths));
  });

  it('hollows a hole: an inner contour splits the span (even-odd)', () => {
    // 100×100 outer with a centred 40×40 hole. At a scan line through the hole
    // (e.g. y = 45), the single full-width span becomes two spans flanking it.
    const hole: Point[] = [
      [30, 30],
      [70, 30],
      [70, 70],
      [30, 70],
    ];
    const through = hachureSegments(
      [square, hole],
      opts({ hachureAngle: 0, hachureGap: 10 }),
    ).filter((s) => Math.abs(s.y1 - 45) < 0.01);
    expect(through).toHaveLength(2); // left span 0..30 and right span 70..100
    const widths = through.map((s) => Math.abs(s.x2 - s.x1)).sort();
    expect(widths[0]).toBeCloseTo(30, 5);
    expect(widths[1]).toBeCloseTo(30, 5);
  });

  it('returns nothing for a degenerate (sub-3-point) polygon', () => {
    expect(
      hachureSegments(
        [
          [
            [0, 0],
            [1, 1],
          ],
        ],
        opts({}),
      ),
    ).toEqual([]);
  });
});

describe('isPointInContours', () => {
  it('treats a point inside a hole as outside (even-odd)', () => {
    const hole: Point[] = [
      [30, 30],
      [70, 30],
      [70, 70],
      [30, 70],
    ];
    expect(isPointInContours([10, 10], [square, hole])).toBe(true); // in ring, not hole
    expect(isPointInContours([50, 50], [square, hole])).toBe(false); // inside the hole
    expect(isPointInContours([200, 200], [square, hole])).toBe(false); // fully outside
  });
});
