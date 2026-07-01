import { afterEach, describe, expect, it } from 'vitest';
import { DETERMINISTIC_SEED_GLOBAL, forcedSeed, setForcedSeed } from './seed.js';

describe('forced seed override', () => {
  afterEach(() => setForcedSeed(null));

  it('returns null when no seed is pinned', () => {
    expect(forcedSeed()).toBeNull();
  });

  it('returns the pinned seed after setForcedSeed', () => {
    setForcedSeed(1234);
    expect(forcedSeed()).toBe(1234);
    expect((globalThis as Record<string, unknown>)[DETERMINISTIC_SEED_GLOBAL]).toBe(1234);
  });

  it('clears the override with null', () => {
    setForcedSeed(1234);
    setForcedSeed(null);
    expect(forcedSeed()).toBeNull();
    expect(DETERMINISTIC_SEED_GLOBAL in (globalThis as Record<string, unknown>)).toBe(false);
  });

  it('ignores a non-finite pinned value', () => {
    (globalThis as Record<string, unknown>)[DETERMINISTIC_SEED_GLOBAL] = Number.NaN;
    expect(forcedSeed()).toBeNull();
  });
});
