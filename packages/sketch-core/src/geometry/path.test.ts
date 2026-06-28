import { describe, expect, it } from 'vitest';
import type { SketchOptions } from '../types.js';
import { linearizePath, path } from './path.js';

const base: SketchOptions = { roughness: 1.2, bowing: 1, seed: 7 };

describe('linearizePath', () => {
  it('parses absolute move + line into one open subpath', () => {
    const sp = linearizePath('M0 0 L10 0 L10 10');
    expect(sp).toHaveLength(1);
    expect(sp[0]?.closed).toBe(false);
    expect(sp[0]?.points).toEqual([
      [0, 0],
      [10, 0],
      [10, 10],
    ]);
  });

  it('resolves relative commands against the running point', () => {
    const sp = linearizePath('M10 10 l5 0 l0 5');
    expect(sp[0]?.points).toEqual([
      [10, 10],
      [15, 10],
      [15, 15],
    ]);
  });

  it('treats implicit repeated coordinates after M as lineto', () => {
    const sp = linearizePath('M0 0 1 1 2 2');
    expect(sp[0]?.points).toEqual([
      [0, 0],
      [1, 1],
      [2, 2],
    ]);
  });

  it('expands H and V into absolute points', () => {
    const sp = linearizePath('M0 0 H10 V10 h-10 v-10');
    expect(sp[0]?.points).toEqual([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ]);
  });

  it('closes a subpath on Z and starts a fresh one on the next M', () => {
    const sp = linearizePath('M0 0 H10 V10 Z M20 20 H30');
    expect(sp).toHaveLength(2);
    expect(sp[0]?.closed).toBe(true);
    expect(sp[1]?.closed).toBe(false);
    expect(sp[1]?.points[0]).toEqual([20, 20]);
  });

  it('flattens a cubic Bézier into multiple segments ending at its endpoint', () => {
    const sp = linearizePath('M0 0 C0 50 100 50 100 0');
    const pts = sp[0]?.points ?? [];
    expect(pts.length).toBeGreaterThan(2);
    expect(pts[0]).toEqual([0, 0]);
    expect(pts[pts.length - 1]).toEqual([100, 0]);
  });

  it('flattens a quadratic Bézier ending at its endpoint', () => {
    const sp = linearizePath('M0 0 Q50 50 100 0');
    const pts = sp[0]?.points ?? [];
    expect(pts.length).toBeGreaterThan(2);
    expect(pts[pts.length - 1]).toEqual([100, 0]);
  });

  it('reflects the control point for the smooth-cubic S shorthand', () => {
    const sp = linearizePath('M0 0 C0 10 10 10 10 0 S20 -10 20 0');
    const pts = sp[0]?.points ?? [];
    expect(pts[pts.length - 1]).toEqual([20, 0]);
  });

  it('flattens an arc from start to end point', () => {
    const sp = linearizePath('M0 0 A10 10 0 0 1 20 0');
    const pts = sp[0]?.points ?? [];
    expect(pts.length).toBeGreaterThan(2);
    const last = pts[pts.length - 1] ?? [0, 0];
    expect(last[0]).toBeCloseTo(20, 5);
    expect(last[1]).toBeCloseTo(0, 5);
  });

  it('parses arc flags packed without separators', () => {
    const sp = linearizePath('M0 0a10 10 0 0110 10');
    const pts = sp[0]?.points ?? [];
    const last = pts[pts.length - 1] ?? [0, 0];
    expect(last[0]).toBeCloseTo(10, 5);
    expect(last[1]).toBeCloseTo(10, 5);
  });

  it('throws on data that does not begin with a moveto', () => {
    expect(() => linearizePath('L10 10')).toThrow();
  });
});

describe('path', () => {
  const square = 'M0 0 H40 V40 H0 Z';

  it('double-strokes every flattened edge (2 paths per segment)', () => {
    const r = path('M0 0 L10 0 L10 10', base);
    expect(r.strokePaths).toHaveLength(4); // 2 edges × double-stroke
    for (const d of r.strokePaths) {
      expect(d).toMatch(/^M[-\d.]+ [-\d.]+ C/);
    }
  });

  it('closes the loop for a Z subpath (4 edges for a square)', () => {
    const r = path(square, base);
    expect(r.strokePaths).toHaveLength(8); // 4 edges × double-stroke
  });

  it('has no fill by default', () => {
    expect(path(square, base).fillPaths).toEqual([]);
  });

  it('fills a closed subpath when fillStyle is set', () => {
    const r = path(square, { ...base, fillStyle: 'hachure', hachureGap: 6 });
    expect(r.fillPaths.length).toBeGreaterThan(0);
  });

  it('does not fill an open subpath', () => {
    const r = path('M0 0 L40 0 L40 40', { ...base, fillStyle: 'hachure', hachureGap: 6 });
    expect(r.fillPaths).toEqual([]);
  });

  it('same seed → byte-identical output (determinism)', () => {
    expect(path(square, base)).toEqual(path(square, base));
  });

  it('different seed → different output', () => {
    const a = path(square, base);
    const b = path(square, { ...base, seed: 99 });
    expect(a.strokePaths).not.toEqual(b.strokePaths);
  });

  it('roughness 0 + bowing 0 keeps the first horizontal edge flat at y = 0', () => {
    const r = path('M0 0 H40', { ...base, roughness: 0, bowing: 0 });
    for (const d of r.strokePaths) {
      const ys = [...d.matchAll(/-?\d+(?:\.\d+)?/g)]
        .map((m) => Number(m[0]))
        .filter((_, i) => i % 2 === 1);
      for (const y of ys) {
        expect(y).toBe(0);
      }
    }
  });

  it('matches the golden snapshot (regression lock)', () => {
    const r = path('M0 0 C0 30 30 30 30 0 L60 0 A15 15 0 0 1 60 30 Z', {
      roughness: 1.5,
      bowing: 1,
      seed: 42,
    });
    expect(r).toMatchSnapshot();
  });
});
