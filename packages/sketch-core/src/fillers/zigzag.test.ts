import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../prng.js';
import type { Point, SketchOptions } from '../types.js';
import { zigzag } from './zigzag.js';

/** Each call gets a fresh PRNG from the seed, mirroring how shapes invoke it. */
const run = (contours: Point[][], o: SketchOptions): string[] =>
  zigzag(contours, o, mulberry32(o.seed));

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

/** Pull every numeric coordinate out of a list of `d` strings. */
const coords = (paths: string[]): number[] =>
  paths.flatMap((d) => [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0])));

describe('zigzag', () => {
  it('produces sketchy fill paths for a closed polygon', () => {
    const paths = run([square], opts({ hachureGap: 10 }));
    expect(paths.length).toBeGreaterThan(0);
    for (const d of paths) {
      expect(d).toMatch(/^M[-\d.]+ [-\d.]+ C/);
    }
  });

  it('packs more wave segments than plain hachure has lines', () => {
    // Each scan line becomes several wave edges, so zigzag yields more paths.
    const paths = run([square], opts({ hachureGap: 10, hachureAngle: 0 }));
    expect(paths.length).toBeGreaterThan(10 * 2); // 10 scan lines × 2 strokes
  });

  it('keeps every vertex inside the outline (no bleed)', () => {
    // With roughness/bowing 0 the curve control points lie on the straight wave
    // edges, so every emitted coordinate of a convex polygon must stay in bounds.
    const paths = run([square], opts({ roughness: 0, bowing: 0, hachureGap: 10, hachureAngle: 0 }));
    const nums = coords(paths);
    expect(nums.length).toBeGreaterThan(0);
    const eps = 0.02; // serialize precision
    for (const n of nums) {
      expect(n).toBeGreaterThanOrEqual(0 - eps);
      expect(n).toBeLessThanOrEqual(100 + eps);
    }
  });

  it('is deterministic for a given seed', () => {
    expect(run([square], opts({ hachureGap: 10 }))).toEqual(
      run([square], opts({ hachureGap: 10 })),
    );
  });

  it('returns nothing for a degenerate polygon', () => {
    expect(
      run(
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
