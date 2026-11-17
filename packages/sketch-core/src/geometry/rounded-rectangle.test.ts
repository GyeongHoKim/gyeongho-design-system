import { describe, expect, it } from 'vitest';
import type { SketchOptions } from '../types.js';
import { rectangle } from './rectangle.js';
import { roundedRectangle } from './rounded-rectangle.js';

const base: SketchOptions = { roughness: 1.5, bowing: 1, seed: 42 };
const clean: SketchOptions = { ...base, roughness: 0, bowing: 0 };

/** Every `[x, y]` coordinate pair in a list of path `d` strings. */
function points(paths: string[]): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (const d of paths) {
    const nums = [...d.matchAll(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g)].map((m) => Number(m[0]));
    for (let i = 0; i + 1 < nums.length; i += 2) {
      out.push([nums[i] as number, nums[i + 1] as number]);
    }
  }
  return out;
}

describe('roundedRectangle', () => {
  it('r = 0 → byte-identical to rectangle()', () => {
    expect(roundedRectangle(0, 0, 100, 40, 0, base)).toEqual(rectangle(0, 0, 100, 40, base));
  });

  it('NaN / negative r → falls back to rectangle()', () => {
    const plain = rectangle(0, 0, 100, 40, base);
    expect(roundedRectangle(0, 0, 100, 40, Number.NaN, base)).toEqual(plain);
    expect(roundedRectangle(0, 0, 100, 40, -5, base)).toEqual(plain);
  });

  it('clamps r to min(w, h) / 2 (pill)', () => {
    expect(roundedRectangle(0, 0, 100, 40, 9999, base)).toEqual(
      roundedRectangle(0, 0, 100, 40, 20, base),
    );
  });

  it('differs from rectangle() when r > 0', () => {
    expect(roundedRectangle(0, 0, 100, 40, 20, base).strokePaths).not.toEqual(
      rectangle(0, 0, 100, 40, base).strokePaths,
    );
  });

  it('same seed → identical paths; different seed → different paths', () => {
    const a = roundedRectangle(0, 0, 100, 40, 20, base);
    const b = roundedRectangle(0, 0, 100, 40, 20, base);
    const c = roundedRectangle(0, 0, 100, 40, 20, { ...base, seed: 7 });
    expect(a).toEqual(b);
    expect(a.strokePaths).not.toEqual(c.strokePaths);
  });

  it('w === h → a valid circle with no NaN', () => {
    const r = roundedRectangle(0, 0, 24, 24, 9999, base);
    expect(r.strokePaths.length).toBeGreaterThan(0);
    expect(r.strokePaths.join(' ')).not.toContain('NaN');
  });

  it('tiny radius (0.5) → valid paths with no NaN', () => {
    const r = roundedRectangle(0, 0, 100, 40, 0.5, base);
    expect(r.strokePaths.length).toBeGreaterThan(0);
    expect(r.strokePaths.join(' ')).not.toContain('NaN');
  });

  it('stays inside its box and pulls the corners in', () => {
    const r = roundedRectangle(2, 3, 100, 40, 20, clean);
    const pts = points(r.strokePaths);
    expect(pts.length).toBeGreaterThan(0);
    const eps = 1e-6;
    for (const [x, y] of pts) {
      expect(x).toBeGreaterThanOrEqual(2 - eps);
      expect(x).toBeLessThanOrEqual(102 + eps);
      expect(y).toBeGreaterThanOrEqual(3 - eps);
      expect(y).toBeLessThanOrEqual(43 + eps);
    }
    const nearCorner = pts.some(([x, y]) => Math.hypot(x - 2, y - 3) <= 1);
    expect(nearCorner).toBe(false);
  });

  it('solid fill → non-empty fillPaths; no fillStyle → empty fillPaths', () => {
    expect(
      roundedRectangle(0, 0, 100, 40, 20, { ...base, fillStyle: 'solid' }).fillPaths.length,
    ).toBeGreaterThan(0);
    expect(roundedRectangle(0, 0, 100, 40, 20, base).fillPaths).toEqual([]);
  });

  it('elevation > 0 → shadowPaths present', () => {
    const r = roundedRectangle(0, 0, 100, 40, 20, { ...base, elevation: 4 });
    expect(r.shadowPaths?.length ?? 0).toBeGreaterThan(0);
  });

  it('matches the golden snapshot (regression lock)', () => {
    expect(roundedRectangle(0, 0, 100, 40, 20, base).strokePaths).toMatchSnapshot();
  });
});
