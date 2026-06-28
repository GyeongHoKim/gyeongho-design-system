import { describe, expect, it } from 'vitest';
import type { SketchOptions } from '../types.js';
import { rectangle } from './rectangle.js';

const base: SketchOptions = { roughness: 1.5, bowing: 1, seed: 42 };

describe('rectangle', () => {
  it('emits 8 stroke paths (4 edges × double-stroke)', () => {
    const r = rectangle(0, 0, 100, 60, base);
    expect(r.strokePaths).toHaveLength(8);
    expect(r.fillPaths).toEqual([]);
  });

  it('every stroke path is a valid move-then-curve d string', () => {
    const r = rectangle(0, 0, 100, 60, base);
    for (const d of r.strokePaths) {
      expect(d).toMatch(/^M[-\d.]+ [-\d.]+ C/);
    }
  });

  it('same seed → byte-identical paths (determinism)', () => {
    const a = rectangle(0, 0, 100, 60, base);
    const b = rectangle(0, 0, 100, 60, base);
    expect(a.strokePaths).toEqual(b.strokePaths);
  });

  it('different seed → different paths', () => {
    const a = rectangle(0, 0, 100, 60, base);
    const b = rectangle(0, 0, 100, 60, { ...base, seed: 7 });
    expect(a.strokePaths).not.toEqual(b.strokePaths);
  });

  it('roughness 0 + bowing 0 produces clean, wobble-free edges', () => {
    const r = rectangle(0, 0, 100, 60, { ...base, roughness: 0, bowing: 0 });
    expect(r.strokePaths).toHaveLength(8);
    // The top edge (first two stroke paths) runs along y = 0; with the wobble
    // disabled, every y coordinate in those paths must be exactly 0.
    for (const d of r.strokePaths.slice(0, 2)) {
      const nums = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
      const ys = nums.filter((_, i) => i % 2 === 1);
      for (const y of ys) {
        expect(y).toBe(0);
      }
    }
  });

  it('matches the golden snapshot (regression lock)', () => {
    const r = rectangle(0, 0, 100, 60, base);
    expect(r.strokePaths).toMatchSnapshot();
  });
});
