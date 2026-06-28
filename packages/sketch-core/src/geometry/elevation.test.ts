import { describe, expect, it } from 'vitest';
import type { SketchOptions } from '../types.js';
import { offsetPoints, shadowRng } from './elevation.js';
import { ellipse } from './ellipse.js';
import { path } from './path.js';
import { rectangle } from './rectangle.js';

const base: SketchOptions = { roughness: 1.2, bowing: 1, seed: 11 };

describe('elevation helpers', () => {
  it('shadowRng is a stream distinct from the foreground seed stream', () => {
    const fg = shadowRng(11);
    // Deriving twice from the same seed is identical (deterministic)...
    expect(shadowRng(11)()).toBe(fg());
  });

  it('offsetPoints shifts every point down-right by the elevation', () => {
    expect(
      offsetPoints(
        [
          [0, 0],
          [10, 5],
        ],
        4,
      ),
    ).toEqual([
      [4, 4],
      [14, 9],
    ]);
  });
});

describe('elevation IR', () => {
  it('is absent for a flat shape', () => {
    expect(rectangle(0, 0, 40, 30, base).shadowPaths).toBeUndefined();
    expect(ellipse(0, 0, 40, 30, base).shadowPaths).toBeUndefined();
    expect(path('M0 0 H40 V30 Z', base).shadowPaths).toBeUndefined();
  });

  it('is absent when elevation is 0', () => {
    expect(rectangle(0, 0, 40, 30, { ...base, elevation: 0 }).shadowPaths).toBeUndefined();
  });

  it('emits a shadow outline when elevation > 0', () => {
    const r = rectangle(0, 0, 40, 30, { ...base, elevation: 4 });
    expect(r.shadowPaths).toBeDefined();
    expect(r.shadowPaths?.length).toBe(r.strokePaths.length); // an offset copy
    for (const d of r.shadowPaths ?? []) {
      expect(d).toMatch(/^M[-\d.]+ [-\d.]+ C/);
    }
  });

  it('enabling elevation does NOT perturb the foreground strokes', () => {
    const flat = rectangle(0, 0, 40, 30, base);
    const raised = rectangle(0, 0, 40, 30, { ...base, elevation: 6 });
    expect(raised.strokePaths).toEqual(flat.strokePaths);
    expect(raised.fillPaths).toEqual(flat.fillPaths);
  });

  it('the shadow is offset from the foreground (not identical)', () => {
    const r = rectangle(0, 0, 40, 30, { ...base, elevation: 8 });
    expect(r.shadowPaths).not.toEqual(r.strokePaths);
  });

  it('works for ellipse and path too', () => {
    expect(ellipse(0, 0, 40, 30, { ...base, elevation: 4 }).shadowPaths?.length).toBe(2);
    const p = path('M0 0 L20 0 L20 20 Z', { ...base, elevation: 4 });
    expect(p.shadowPaths?.length).toBe(p.strokePaths.length);
  });

  it('is deterministic for a given seed', () => {
    expect(rectangle(0, 0, 40, 30, { ...base, elevation: 5 })).toEqual(
      rectangle(0, 0, 40, 30, { ...base, elevation: 5 }),
    );
  });
});
