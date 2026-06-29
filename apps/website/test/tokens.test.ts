import { describe, expect, it } from 'vitest';
import { designStyle, section, toCssVar } from '../src/lib/tokens';

describe('design-style token reader', () => {
  it('maps a dotted token path to its generated CSS variable', () => {
    expect(toCssVar('sys.color.bg.primary.default')).toBe('--sys-color-bg-primary-default');
    expect(toCssVar('sys.typography.body.fontSize')).toBe('--sys-typography-body-fontSize');
  });

  it('flattens a sys subtree into resolved token rows', () => {
    const colors = section('sys.color');
    expect(colors.length).toBeGreaterThan(0);
    for (const token of colors) {
      expect(token.path.startsWith('sys.color.')).toBe(true);
      expect(token.cssVar).toBe(toCssVar(token.path));
      expect(typeof token.value).toBe('string');
      expect(token.value.length).toBeGreaterThan(0);
    }
  });

  it('attaches a dark value only where it differs from light', () => {
    const canvas = section('sys.color').find((t) => t.path === 'sys.color.bg.canvas');
    expect(canvas).toBeDefined();
    // The canvas background flips between themes, so a distinct dark value exists.
    expect(canvas?.darkValue).toBeDefined();
    expect(canvas?.darkValue).not.toBe(canvas?.value);
  });

  it('derives every Design Style section from the token source', () => {
    expect(designStyle.palette().length).toBeGreaterThan(0);
    expect(designStyle.typography().length).toBeGreaterThan(0);
    expect(designStyle.spacing().length).toBeGreaterThan(0);
    expect(designStyle.radius().length).toBeGreaterThan(0);
    expect(designStyle.shadow().length).toBeGreaterThan(0);
  });
});
