import { describe, expect, it } from 'vitest';
import type { SketchOptions } from '../types.js';
import { ellipse } from './ellipse.js';

const base: SketchOptions = { roughness: 1.2, bowing: 1, seed: 9 };

describe('ellipse', () => {
  it('emits two closed stroke paths (double-stroke)', () => {
    const r = ellipse(0, 0, 120, 80, base);
    expect(r.strokePaths).toHaveLength(2);
    for (const d of r.strokePaths) {
      expect(d).toMatch(/^M[-\d.]+ [-\d.]+ C/);
    }
  });

  it('is deterministic for a given seed', () => {
    expect(ellipse(0, 0, 120, 80, base)).toEqual(ellipse(0, 0, 120, 80, base));
  });

  it('differs by seed', () => {
    const a = ellipse(0, 0, 120, 80, base);
    const b = ellipse(0, 0, 120, 80, { ...base, seed: 3 });
    expect(a.strokePaths).not.toEqual(b.strokePaths);
  });

  it('fills when requested', () => {
    const r = ellipse(0, 0, 120, 80, { ...base, fillStyle: 'hachure', hachureGap: 10 });
    expect(r.fillPaths.length).toBeGreaterThan(0);
  });

  it('matches the golden snapshot (regression lock)', () => {
    expect(ellipse(0, 0, 120, 80, base)).toMatchSnapshot();
  });
});
