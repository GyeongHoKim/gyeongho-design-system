import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../prng.js';
import type { Point, SketchOptions } from '../types.js';
import { dots } from './dots.js';

/** Each call gets a fresh PRNG from the seed, mirroring how shapes invoke it. */
const run = (points: Point[], o: SketchOptions): string[] => dots(points, o, mulberry32(o.seed));

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

describe('dots', () => {
  it('emits one closed circle path per dot', () => {
    const paths = run(square, opts({ hachureGap: 20 }));
    expect(paths.length).toBeGreaterThan(0);
    for (const d of paths) {
      // A dot is move + four cubic Béziers.
      expect(d).toMatch(
        /^M[-\d.]+ [-\d.]+( C[-\d.]+ [-\d.]+, [-\d.]+ [-\d.]+, [-\d.]+ [-\d.]+){4}$/,
      );
    }
  });

  it('packs more dots as the gap shrinks', () => {
    const wide = run(square, opts({ hachureGap: 25 }));
    const tight = run(square, opts({ hachureGap: 10 }));
    expect(tight.length).toBeGreaterThan(wide.length);
  });

  it('roughly fills a grid (≈ area / gap²)', () => {
    const paths = run(square, opts({ hachureGap: 20 }));
    // 100×100 area, gap 20 ⇒ ~5×5 grid. Allow slack for edge clipping/jitter.
    expect(paths.length).toBeGreaterThanOrEqual(16);
    expect(paths.length).toBeLessThanOrEqual(36);
  });

  it('is deterministic for a given seed', () => {
    expect(run(square, opts({ hachureGap: 20 }))).toEqual(run(square, opts({ hachureGap: 20 })));
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
