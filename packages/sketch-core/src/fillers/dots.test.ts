import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../prng.js';
import type { Point, SketchOptions } from '../types.js';
import { dots } from './dots.js';

/** Each call gets a fresh PRNG from the seed, mirroring how shapes invoke it. */
const run = (contours: Point[][], o: SketchOptions): string[] =>
  dots(contours, o, mulberry32(o.seed));

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
    const paths = run([square], opts({ hachureGap: 20 }));
    expect(paths.length).toBeGreaterThan(0);
    for (const d of paths) {
      // A dot is move + four cubic Béziers.
      expect(d).toMatch(
        /^M[-\d.]+ [-\d.]+( C[-\d.]+ [-\d.]+, [-\d.]+ [-\d.]+, [-\d.]+ [-\d.]+){4}$/,
      );
    }
  });

  it('packs more dots as the gap shrinks', () => {
    const wide = run([square], opts({ hachureGap: 25 }));
    const tight = run([square], opts({ hachureGap: 10 }));
    expect(tight.length).toBeGreaterThan(wide.length);
  });

  it('roughly fills a grid (≈ area / gap²)', () => {
    const paths = run([square], opts({ hachureGap: 20, hachureAngle: 0 }));
    // 100×100 area, gap 20 ⇒ ~5×5 grid. Allow slack for edge clipping/jitter.
    expect(paths.length).toBeGreaterThanOrEqual(16);
    expect(paths.length).toBeLessThanOrEqual(36);
  });

  it('honours hachureAngle — rotating the grid changes the stipple', () => {
    // Regression: dots used to reimplement an axis-aligned scan and ignore the
    // angle, so every angle produced identical output. Now it reuses the shared
    // hachure scan, so different angles place dots along different scan lines.
    const o = opts({ hachureGap: 20 });
    const a0 = run([square], { ...o, hachureAngle: 0 });
    const a45 = run([square], { ...o, hachureAngle: 45 });
    const a90 = run([square], { ...o, hachureAngle: 90 });
    expect(a45).not.toEqual(a0);
    expect(a90).not.toEqual(a0);
    expect(a90).not.toEqual(a45);
  });

  it('hollows a hole (even-odd) — fewer dots than the solid square', () => {
    const hole: Point[] = [
      [30, 30],
      [70, 30],
      [70, 70],
      [30, 70],
    ];
    const solidSquare = run([square], opts({ hachureGap: 10, hachureAngle: 0 }));
    const withHole = run([square, hole], opts({ hachureGap: 10, hachureAngle: 0 }));
    expect(withHole.length).toBeLessThan(solidSquare.length);
  });

  it('is deterministic for a given seed', () => {
    expect(run([square], opts({ hachureGap: 20 }))).toEqual(
      run([square], opts({ hachureGap: 20 })),
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
