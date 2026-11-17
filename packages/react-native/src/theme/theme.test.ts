import { lightTokens } from '@ghds/tokens/rn';
import { describe, expect, it } from 'vitest';
import { darkTheme, lightTheme, resolveFontFamily, toTextVariant } from './theme.js';

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

  it('converts typography to absolute RN line-height', () => {
    const body = lightTokens.sys.typography.body;
    expect(lightTheme.textVariants.body.lineHeight).toBe(
      Math.round(body.fontSize * body.lineHeight),
    );
  });

  it('picks a weight-specific family per variant on iOS, without fontWeight', () => {
    const t = lightTokens.sys.typography;
    const ios = {
      heading: toTextVariant(t.heading, 'ios'),
      title: toTextVariant(t.title, 'ios'),
      body: toTextVariant(t.body, 'ios'),
      label: toTextVariant(t.label, 'ios'),
      caption: toTextVariant(t.caption, 'ios'),
      code: toTextVariant(t.code, 'ios'),
    };
    expect(ios.heading).toEqual({
      fontFamily: 'Gaegu-Bold',
      fontSize: t.heading.fontSize,
      lineHeight: Math.round(t.heading.fontSize * t.heading.lineHeight),
    });
    expect(ios.title.fontFamily).toBe('Gaegu-Bold');
    expect(ios.body.fontFamily).toBe('NotoSansKR-Regular');
    expect(ios.label.fontFamily).toBe('NotoSansKR-Medium');
    expect(ios.caption.fontFamily).toBe('NotoSansKR-Regular');
    expect(ios.code.fontFamily).toBe('Menlo-Regular');
    for (const variant of Object.values(ios)) expect(variant).not.toHaveProperty('fontWeight');
  });

  it('uses the Android face names and monospace for code on Android, without fontWeight', () => {
    const t = lightTokens.sys.typography;
    expect(toTextVariant(t.label, 'android').fontFamily).toBe('NotoSansKR-Medium');
    expect(toTextVariant(t.heading, 'android').fontFamily).toBe('Gaegu-Bold');
    const code = toTextVariant(t.code, 'android');
    expect(code.fontFamily).toBe('monospace');
    expect(code).not.toHaveProperty('fontWeight');
  });

  it('uses the iOS face table on macOS, where Menlo exists', () => {
    const t = lightTokens.sys.typography;
    expect(toTextVariant(t.code, 'macos').fontFamily).toBe('Menlo-Regular');
    expect(toTextVariant(t.label, 'macos').fontFamily).toBe('NotoSansKR-Medium');
  });

  it('exposes a code text variant built from sys.typography.code', () => {
    const code = lightTokens.sys.typography.code;
    // The test runner renders through react-native-web, so the Android table applies.
    expect(lightTheme.textVariants.code).toEqual(toTextVariant(code, 'web'));
    expect(lightTheme.textVariants.code.fontFamily).toBe('monospace');
  });

  it('keeps fontWeight on web, where the named faces fall back to the default face', () => {
    const label = lightTokens.sys.typography.label;
    const web = toTextVariant(label, 'web');
    expect(web.fontFamily).toBe('NotoSansKR-Medium');
    expect(web.fontWeight).toBe(String(label.fontWeight));
    // The test runner renders through react-native-web, so the built theme is the web one.
    expect(lightTheme.textVariants.label).toEqual(web);
  });

  it('resolveFontFamily throws for a weight the face table does not name', () => {
    const face = lightTokens.sys.typography.body.fontFamily;
    expect(resolveFontFamily(face, 400, 'ios')).toBe('NotoSansKR-Regular');
    expect(() => resolveFontFamily(face, 300, 'android')).toThrow(/weight 300/);
  });

  it('carries sketch parameters from the sketch token group', () => {
    expect(lightTheme.sketch.roughness).toBe(lightTokens.sys.sketch.roughness);
    expect(lightTheme.buttonSketch.bowing).toBe(lightTokens.comp.button.sketch.bowing);
  });

  it('derives checkbox/radio/switch colors and sketch params from their own comp tokens', () => {
    expect(lightTheme.colors.checkboxBgCheckedDefault).toBe(
      lightTokens.comp.checkbox.bg.checked.default,
    );
    expect(lightTheme.colors.radioDotDefault).toBe(lightTokens.comp.radio.dot.default);
    expect(lightTheme.colors.switchThumbColorDefault).toBe(
      lightTokens.comp.switch.thumb.color.default,
    );
    expect(lightTheme.checkboxSketch.roughness).toBe(lightTokens.comp.checkbox.sketch.roughness);
    expect(lightTheme.radioSketch.bowing).toBe(lightTokens.comp.radio.sketch.bowing);
    expect(lightTheme.switchSketch.roughness).toBe(lightTokens.comp.switch.sketch.roughness);
  });

  it('derives select colors and sketch params (incl. elevation) from comp.select tokens', () => {
    expect(lightTheme.colors.selectOptionBgSelected).toBe(
      lightTokens.comp.select.option.bg.selected,
    );
    expect(lightTheme.colors.selectPanelStroke).toBe(lightTokens.comp.select.panel.stroke);
    expect(lightTheme.selectSketch.roughness).toBe(lightTokens.comp.select.sketch.roughness);
    expect(lightTheme.selectSketch.elevation).toBe(lightTokens.comp.select.sketch.elevation);
  });

  it('derives overlay panel min-widths from tokens without changing the rendered widths', () => {
    const { overlayMinWidths } = lightTheme;
    expect(overlayMinWidths.menu).toBe(lightTokens.comp.menu.panel.minWidth);
    expect(overlayMinWidths.popover).toBe(lightTokens.comp.popover.minWidth);
    expect(overlayMinWidths.contextMenu).toBe(lightTokens.sys.overlay.minWidth.md);
    expect(overlayMinWidths.navigationMenu).toBe(lightTokens.sys.overlay.minWidth.xl);
    expect(overlayMinWidths.hoverCard).toBe(lightTokens.sys.overlay.minWidth.xl);
    // Previously hardcoded as 160 and `spacing['2xl']` multiples.
    const step = lightTokens.sys.spacing['2xl'];
    expect(overlayMinWidths.menu).toBe(160);
    expect(overlayMinWidths.popover).toBe(step * 4);
    expect(overlayMinWidths.contextMenu).toBe(step * 4);
    expect(overlayMinWidths.navigationMenu).toBe(step * 5);
    expect(overlayMinWidths.hoverCard).toBe(step * 5);
  });

  it('light and dark themes share an identical structure', () => {
    const keys = (o: object): string[] => Object.keys(o).sort();
    expect(keys(lightTheme.colors)).toEqual(keys(darkTheme.colors));
    expect(keys(lightTheme.spacing)).toEqual(keys(darkTheme.spacing));
    expect(keys(lightTheme.textVariants)).toEqual(keys(darkTheme.textVariants));
  });
});
