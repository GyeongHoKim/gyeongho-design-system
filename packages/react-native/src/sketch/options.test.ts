import { describe, expect, it } from 'vitest';
import { buildRectangleOutline, makeSeed, type SketchParams } from './options.js';

const PARAMS: SketchParams = { roughness: 1.4, bowing: 2, seed: 42 };

describe('buildRectangleOutline', () => {
  it('returns null before the component is measured (zero size)', () => {
    expect(buildRectangleOutline({ width: 0, height: 0 }, 2, PARAMS)).toBeNull();
  });

  it('returns null when the inset collapses the rectangle', () => {
    expect(buildRectangleOutline({ width: 3, height: 3 }, 2, PARAMS)).toBeNull();
  });

  it('produces stroke paths for a measured size', () => {
    const drawable = buildRectangleOutline({ width: 120, height: 48 }, 2, PARAMS);
    expect(drawable).not.toBeNull();
    expect(drawable?.strokePaths.length).toBeGreaterThan(0);
    expect(drawable?.strokePaths.every((d) => d.startsWith('M'))).toBe(true);
  });

  it('is deterministic: same seed + size yields identical geometry (no jitter)', () => {
    const a = buildRectangleOutline({ width: 120, height: 48 }, 2, PARAMS);
    const b = buildRectangleOutline({ width: 120, height: 48 }, 2, PARAMS);
    expect(a?.strokePaths).toEqual(b?.strokePaths);
  });

  it('regenerates geometry when the size changes', () => {
    const a = buildRectangleOutline({ width: 120, height: 48 }, 2, PARAMS);
    const b = buildRectangleOutline({ width: 200, height: 48 }, 2, PARAMS);
    expect(a?.strokePaths).not.toEqual(b?.strokePaths);
  });

  it('emits fill paths only when a fill style is requested', () => {
    const unfilled = buildRectangleOutline({ width: 120, height: 48 }, 2, PARAMS);
    const filled = buildRectangleOutline({ width: 120, height: 48 }, 2, {
      ...PARAMS,
      fillStyle: 'hachure',
      hachureGap: 8,
      hachureAngle: -41,
    });
    expect(unfilled?.fillPaths.length).toBe(0);
    expect(filled?.fillPaths.length).toBeGreaterThan(0);
  });

  it('emits shadow paths only when elevation is positive', () => {
    const flat = buildRectangleOutline({ width: 120, height: 48 }, 2, { ...PARAMS, elevation: 0 });
    const raised = buildRectangleOutline({ width: 120, height: 48 }, 2, {
      ...PARAMS,
      elevation: 4,
    });
    expect(flat?.shadowPaths ?? []).toHaveLength(0);
    expect(raised?.shadowPaths?.length ?? 0).toBeGreaterThan(0);
  });
});

describe('makeSeed', () => {
  it('returns a finite unsigned 32-bit integer', () => {
    const seed = makeSeed();
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThanOrEqual(0xffffffff);
  });

  it('varies across instances mounted in the same tick', () => {
    const seeds = new Set(Array.from({ length: 50 }, () => makeSeed()));
    expect(seeds.size).toBeGreaterThan(1);
  });
});
