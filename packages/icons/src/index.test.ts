import { describe, expect, it } from 'vitest';
import { getIconPath, ICON_VIEWBOX, iconNames, iconPaths, iconSeed, isIconName } from './index.js';

describe('@ghds/icons', () => {
  it('exposes a non-empty, sorted list of icon names', () => {
    expect(iconNames.length).toBeGreaterThan(0);
    expect([...iconNames]).toEqual([...iconNames].sort());
  });

  it('every icon has a non-empty path string', () => {
    for (const name of iconNames) {
      expect(typeof iconPaths[name]).toBe('string');
      expect(iconPaths[name].trim().length).toBeGreaterThan(0);
      expect(iconPaths[name]).toMatch(/^M/); // a path starts with a moveto
    }
  });

  it('isIconName narrows known vs unknown names', () => {
    expect(isIconName('close')).toBe(true);
    expect(isIconName('definitely-not-an-icon')).toBe(false);
  });

  it('getIconPath returns the same string as the map', () => {
    expect(getIconPath('close')).toBe(iconPaths.close);
  });

  it('exposes the 24×24 authoring grid', () => {
    expect(ICON_VIEWBOX).toBe(24);
  });

  describe('iconSeed', () => {
    it('is deterministic for a given name', () => {
      expect(iconSeed('search')).toBe(iconSeed('search'));
    });

    it('produces a positive 32-bit integer', () => {
      for (const name of iconNames) {
        const seed = iconSeed(name);
        expect(Number.isInteger(seed)).toBe(true);
        expect(seed).toBeGreaterThan(0);
        expect(seed).toBeLessThanOrEqual(0xffffffff);
      }
    });

    it('differs across most names (low collision)', () => {
      const seeds = new Set(iconNames.map(iconSeed));
      expect(seeds.size).toBe(iconNames.length);
    });
  });
});
