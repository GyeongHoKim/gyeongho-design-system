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
      expect(String(token.value).length).toBeGreaterThan(0);
    }
  });

  it('only computes dark values when asked', () => {
    const canvasPath = 'sys.color.bg.canvas';
    // Without withDark, no dark traversal happens — every row is light-only.
    const lightOnly = section('sys.color').find((t) => t.path === canvasPath);
    expect(lightOnly?.darkValue).toBeUndefined();
    // With withDark, the canvas background (which flips between themes) gets a
    // distinct dark value.
    const withDark = section('sys.color', true).find((t) => t.path === canvasPath);
    expect(withDark?.darkValue).toBeDefined();
    expect(withDark?.darkValue).not.toBe(withDark?.value);
  });

  it('derives every Design Style section from the token source', () => {
    expect(designStyle.palette().length).toBeGreaterThan(0);
    expect(designStyle.typography().length).toBeGreaterThan(0);
    expect(designStyle.spacing().length).toBeGreaterThan(0);
    expect(designStyle.radius().length).toBeGreaterThan(0);
    expect(designStyle.shadow().length).toBeGreaterThan(0);
    // semanticColors must surface dark variants for theme-variant roles.
    expect(designStyle.semanticColors().some((t) => t.darkValue !== undefined)).toBe(true);
  });

  it('lists only role-shaped typography entries (skips the tracking group)', () => {
    const roles = designStyle.typography().map((r) => r.role);
    expect(roles).toContain('body');
    expect(roles).toContain('code');
    expect(roles).not.toContain('tracking');
  });
});
