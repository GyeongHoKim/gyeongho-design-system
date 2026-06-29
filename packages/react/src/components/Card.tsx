import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface } from './SketchSurface.js';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Fill style of the card body. `'solid'` (default) paints a hand-cut paper
   * surface; `'hachure'` gives a sketched, translucent fill.
   */
  fill?: 'solid' | 'hachure';
}

const card = tokens.comp.card;
const c = cssVars.comp.card;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

/**
 * A hand-drawn surface container. The sketchy border + paper fill are generated
 * by `@ghds/sketch-core` (via {@link useSketch}); every color, padding, radius,
 * typography and sketch parameter comes from `@ghds/tokens` (`comp.card.*`).
 * Renders a plain `<div>`, so any ARIA role/landmark is the caller's to set.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { fill = 'solid', children, style, ...rest },
  forwardedRef,
) {
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: fill,
    roughness: card.sketch.roughness,
    bowing: card.sketch.bowing,
    hachureGap: tokens.sys.sketch.hachureGap,
    hachureAngle: tokens.sys.sketch.hachureAngle,
    inset: INSET,
  });

  const ref = mergeRefs(sketchRef, forwardedRef);

  const rootStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: card.gap,
    boxSizing: 'border-box',
    padding: card.padding,
    color: c.text.body,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    fontWeight: tokens.sys.typography.body.fontWeight,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
    ...style,
  };

  return (
    <div ref={ref} style={rootStyle} {...rest}>
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.stroke.default}
        strokeWidth={STROKE_WIDTH}
        fillColor={fill === 'solid' ? c.bg.default : c.bg.muted}
        fillRendering={fill === 'solid' ? 'fill' : 'stroke'}
        fillStrokeWidth={toPx(tokens.sys.border.width.thin)}
      />
      {children}
    </div>
  );
});
