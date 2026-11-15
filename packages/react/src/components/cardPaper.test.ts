import { describe, expect, it } from 'vitest';
import { linedMarginStyle, paperStyle, tiltAngle } from './cardPaper.js';

const base = { tone: 'neutral', tilt: 'none', fastener: 'none' } as const;

describe('paperStyle', () => {
  it('paints sticky paper with the tone background token', () => {
    const style = paperStyle({ ...base, variant: 'sticky', tone: 'warning' });
    expect(style.backgroundColor).toContain('var(--comp-card-sticky-bg-warning');
    // The `background` shorthand would conflict with lined's longhands on a variant switch.
    expect(style.background).toBeUndefined();
  });

  it('puts the fold radius on the bottom-left corner', () => {
    const style = paperStyle({ ...base, variant: 'sticky' });
    const parts = String(style.borderRadius).split(' var(');
    expect(parts).toHaveLength(4);
    expect(parts[3]).toContain('--comp-card-sticky-radius-fold');
  });

  it('draws lined paper rules as a repeating gradient', () => {
    const style = paperStyle({ ...base, variant: 'lined' });
    const image = String(style.backgroundImage);
    expect(image).toContain('repeating-linear-gradient');
    expect(image.match(/linear-gradient\(/g)?.length).toBe(1);
    expect(image).toContain('var(--comp-card-lined-rule-gap');
  });

  it('anchors the lined margin line to the inline-start edge', () => {
    expect(linedMarginStyle).toMatchObject({
      position: 'absolute',
      insetBlock: 0,
      insetInlineStart: expect.stringContaining('var(--comp-card-lined-margin-offset'),
      inlineSize: expect.stringContaining('var(--comp-card-lined-margin-width'),
      backgroundColor: expect.stringContaining('var(--comp-card-lined-margin-color'),
      pointerEvents: 'none',
    });
    expect(linedMarginStyle.left).toBeUndefined();
  });

  it('paints the lined margin line behind the content but above the paper', () => {
    expect(linedMarginStyle.zIndex).toBe(-1);
    expect(paperStyle({ ...base, variant: 'lined' }).isolation).toBe('isolate');
  });

  it('keeps lined children on the rules with no flex gap', () => {
    expect(paperStyle({ ...base, variant: 'lined' }).gap).toBe(0);
  });

  it('reads paper layout and typography through overridable CSS variables', () => {
    const style = paperStyle({ ...base, variant: 'sticky' });
    expect(style.gap).toContain('var(--comp-card-gap');
    expect(style.fontFamily).toContain('var(--sys-typography-body-fontFamily');
    expect(style.fontSize).toContain('var(--sys-typography-body-fontSize');
    expect(style.fontWeight).toContain('var(--sys-typography-body-fontWeight');
    expect(style.lineHeight).toContain('var(--sys-typography-body-lineHeight');
  });

  it('leans left with a negative angle and right with a positive one', () => {
    const left = paperStyle({ ...base, variant: 'sticky', tilt: 'left' });
    const right = paperStyle({ ...base, variant: 'lined', tilt: 'right' });
    expect(left.transform).toContain('rotate(');
    expect(left.transform).toContain('* -1deg');
    expect(left.transform).toContain('--comp-card-tilt-sticky');
    expect(right.transform).toContain('* 1deg');
    expect(right.transform).toContain('--comp-card-tilt-lined');
  });

  it('applies no rotation for tilt none', () => {
    expect(paperStyle({ ...base, variant: 'sticky' }).transform).toBeUndefined();
    expect(tiltAngle('sticky', 'none')).toBe('0deg');
  });

  it('pivots from the top edge only when a fastener is present', () => {
    expect(paperStyle({ ...base, variant: 'sticky', fastener: 'tape' }).transformOrigin).toBe(
      '50% 0',
    );
    expect(paperStyle({ ...base, variant: 'sticky' }).transformOrigin).toBeUndefined();
  });

  it('never clips overhanging fasteners', () => {
    expect(paperStyle({ ...base, variant: 'sticky' }).overflow).toBeUndefined();
  });
});
