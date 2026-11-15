import { tokens } from '@ghds/tokens';
import type { CSSProperties } from 'react';
import { cssVars } from '../lib/cssVars.js';

export type CardVariant = 'plain' | 'sticky' | 'lined';
export type CardTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type CardTilt = 'none' | 'left' | 'right';

const c = cssVars.comp.card;

/**
 * Layout and body typography of the `plain` Card. Resolved token values, as the
 * plain card has always rendered them.
 */
export const cardBodyStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.comp.card.gap,
  boxSizing: 'border-box',
  color: c.text.body,
  fontFamily: tokens.sys.typography.body.fontFamily,
  fontSize: tokens.sys.typography.body.fontSize,
  fontWeight: tokens.sys.typography.body.fontWeight,
  lineHeight: String(tokens.sys.typography.body.lineHeight),
};

const body = cssVars.sys.typography.body;

/** Layout and body typography of the paper variants, overridable through CSS variables. */
const paperBodyStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: c.gap,
  boxSizing: 'border-box',
  color: c.text.body,
  fontFamily: body.fontFamily,
  fontSize: body.fontSize,
  fontWeight: body.fontWeight,
  lineHeight: body.lineHeight,
};

/**
 * CSS angle expression for a paper variant's lean. The tilt tokens are
 * unitless degrees, so the angle is composed with `calc()`.
 */
export function tiltAngle(variant: 'sticky' | 'lined', tilt: CardTilt): string {
  if (tilt === 'none') return '0deg';
  const amount = c.tilt[variant];
  return tilt === 'left' ? `calc(${amount} * -1deg)` : `calc(${amount} * 1deg)`;
}

export interface PaperStyleOptions {
  variant: 'sticky' | 'lined';
  tone: CardTone;
  tilt: CardTilt;
}

/**
 * Margin line of the lined paper, rendered as an aria-hidden element so it
 * follows the inline-start edge (left in LTR, right in RTL) like the padding.
 */
export const linedMarginStyle: CSSProperties = {
  position: 'absolute',
  insetBlock: 0,
  insetInlineStart: c.lined.margin.offset,
  inlineSize: c.lined.margin.width,
  backgroundColor: c.lined.margin.color,
  pointerEvents: 'none',
  // Under the in-flow content, above the paper (the lined root isolates its stacking).
  zIndex: -1,
};

function linedPaper(): CSSProperties {
  const { rule, padding } = c.lined;
  const ruleStart = `calc(${rule.gap} - ${rule.width})`;
  // Rules are symmetric, so a physical gradient is fine in either direction.
  const rules = `repeating-linear-gradient(180deg, transparent 0, transparent ${ruleStart}, ${rule.color} ${ruleStart}, ${rule.color} ${rule.gap})`;
  return {
    backgroundColor: c.lined.bg,
    backgroundImage: rules,
    backgroundPosition: `0 ${padding.top}`,
    backgroundSize: `100% ${rule.gap}`,
    backgroundRepeat: 'repeat',
    // Scopes the margin line's `z-index: -1` to the card, above the paper background.
    isolation: 'isolate',
    borderRadius: c.lined.radius,
    boxShadow: c.lined.shadow,
    // No flex gap: it would push every child after the first off the rules.
    gap: 0,
    paddingBlockStart: padding.top,
    paddingInlineEnd: padding.inline,
    paddingBlockEnd: padding.bottom,
    paddingInlineStart: padding.start,
  };
}

function stickyPaper(tone: CardTone): CSSProperties {
  const { radius, padding } = c.sticky;
  return {
    backgroundColor: c.sticky.bg[tone],
    // top-left, top-right, bottom-right, bottom-left: the fold sits bottom-left.
    borderRadius: `${radius.small} ${radius.small} ${radius.small} ${radius.fold}`,
    boxShadow: c.sticky.shadow,
    paddingBlockStart: padding.top,
    paddingInline: padding.inline,
    paddingBlockEnd: padding.bottom,
  };
}

/** Inline style for a `sticky` or `lined` paper card. */
export function paperStyle({ variant, tone, tilt }: PaperStyleOptions): CSSProperties {
  return {
    ...paperBodyStyle,
    position: 'relative',
    ...(variant === 'sticky' ? stickyPaper(tone) : linedPaper()),
    ...(tilt !== 'none' ? { transform: `rotate(${tiltAngle(variant, tilt)})` } : {}),
  };
}
