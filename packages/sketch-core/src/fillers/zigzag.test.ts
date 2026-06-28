import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../prng.js';
import type { Point, SketchOptions } from '../types.js';
import { zigzag } from './zigzag.js';

/** Each call gets a fresh PRNG from the seed, mirroring how shapes invoke it. */
const run = (points: Point[], o: SketchOptions): string[] => zigzag(points, o, mulberry32(o.seed));

const square: Point[] = [
  [0, 0],
  [100, 0],
  [100, 100],
  [0, 100],
];

const opts = (over: Partial<SketchOptions>): SketchOptions => ({
  roughness: 1,
  bowing: 1,
  seed: 3,
  ...over,
});

describe('zigzag', () => {
  it('produces sketchy fill paths for a closed polygon', () => {
    const paths = run(square, opts({ hachureGap: 10 }));
    expect(paths.length).toBeGreaterThan(0);
    for (const d of paths) {
      expect(d).toMatch(/^M[-\d.]+ [-\d.]+ C/);
    }
  });

  it('packs more wave segments than plain hachure has lines', () => {
    // Each scan line becomes several wave edges, so zigzag yields more paths.
    const paths = run(square, opts({ hachureGap: 10, hachureAngle: 0 }));
    expect(paths.length).toBeGreaterThan(10 * 2); // 10 scan lines × 2 strokes
  });

  it('is deterministic for a given seed', () => {
    expect(run(square, opts({ hachureGap: 10 }))).toEqual(run(square, opts({ hachureGap: 10 })));
  });

  it('returns nothing for a degenerate polygon', () => {
    expect(
      run(
        [
          [0, 0],
          [1, 1],
        ],
        opts({}),
      ),
    ).toEqual([]);
  });
});
