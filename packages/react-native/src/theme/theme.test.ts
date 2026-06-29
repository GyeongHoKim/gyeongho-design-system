import { lightTokens } from '@ghds/tokens/rn';
import { describe, expect, it } from 'vitest';
import { darkTheme, lightTheme } from './theme.js';

describe('GHDS Restyle theme', () => {
  it('derives colors from sys/comp tokens (no hardcoded values)', () => {
    expect(lightTheme.colors.bgSurface).toBe(lightTokens.sys.color.bg.surface);
    expect(lightTheme.colors.textPrimary).toBe(lightTokens.sys.color.text.primary);
    expect(lightTheme.colors.borderFocus).toBe(lightTokens.sys.color.border.focus);
    expect(lightTheme.colors.buttonBgPrimary).toBe(lightTokens.comp.button.bg.primary.default);
  });

  it('maps spacing, radii and border widths from tokens', () => {
    expect(lightTheme.spacing.md).toBe(lightTokens.sys.spacing.md);
    expect(lightTheme.spacing.buttonHorizontal).toBe(lightTokens.comp.button.padding.horizontal);
    expect(lightTheme.borderRadii.md).toBe(lightTokens.sys.radius.md);
    expect(lightTheme.borderWidths.default).toBe(lightTokens.sys.border.width.default);
  });

  it('converts typography to absolute RN line-height and string weight', () => {
    const body = lightTokens.sys.typography.body;
    expect(lightTheme.textVariants.body.lineHeight).toBe(
      Math.round(body.fontSize * body.lineHeight),
    );
    expect(lightTheme.textVariants.body.fontWeight).toBe(String(body.fontWeight));
  });

  it('carries sketch parameters from the sketch token group', () => {
    expect(lightTheme.sketch.roughness).toBe(lightTokens.sys.sketch.roughness);
    expect(lightTheme.buttonSketch.bowing).toBe(lightTokens.comp.button.sketch.bowing);
  });

  it('light and dark themes share an identical structure', () => {
    const keys = (o: object): string[] => Object.keys(o).sort();
    expect(keys(lightTheme.colors)).toEqual(keys(darkTheme.colors));
    expect(keys(lightTheme.spacing)).toEqual(keys(darkTheme.spacing));
    expect(keys(lightTheme.textVariants)).toEqual(keys(darkTheme.textVariants));
  });
});
