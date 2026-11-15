import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import {
  type CardTilt,
  type CardTone,
  type CardVariant,
  cardBodyStyle,
  linedMarginStyle,
  paperStyle,
} from './cardPaper.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export type { CardTilt, CardTone, CardVariant };

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Fill style of the card body. `'solid'` (default) paints a hand-cut paper
   * surface; `'hachure'` gives a sketched, translucent fill. Applies to the
   * `plain` variant only.
   */
  fill?: 'solid' | 'hachure';
  /**
   * Surface treatment. `'plain'` (default) is the sketch-outlined card;
   * `'sticky'` is a coloured note with a folded corner; `'lined'` is ruled
   * notebook paper. Paper variants render a plain `div` with no sketch outline.
   */
  variant?: CardVariant;
  /** Paper colour of a `sticky` card. Default `'neutral'`. */
  tone?: CardTone;
  /** Leans a paper card by a token angle; no effect on `plain`. Default `'none'`. */
  tilt?: CardTilt;
  /**
   * Inline style. Merged last on every variant, so it overrides the card's own
   * styles (for example `margin` or `transform`).
   */
  style?: CSSProperties;
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
  { fill = 'solid', variant = 'plain', tone = 'neutral', tilt = 'none', children, style, ...rest },
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

  // Anything other than a known paper variant renders as plain.
  const paper = variant === 'sticky' || variant === 'lined' ? variant : null;

  const rootStyle: CSSProperties = paper
    ? { ...paperStyle({ variant: paper, tone, tilt }), ...style }
    : {
        // Scopes the `SketchSurface` (`z-index: -1`) to this card so an opaque
        // ancestor can't paint over it (see `sketchHostStyle`).
        ...sketchHostStyle,
        ...cardBodyStyle,
        padding: card.padding,
        ...style,
      };

  // One element tree for every variant: decorative layers sit in fixed slots, so
  // switching `variant` never remounts the children (their state and focus survive).
  return (
    <div ref={paper ? forwardedRef : ref} style={rootStyle} {...rest}>
      {paper ? null : (
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
      )}
      {children}
      {paper === 'lined' ? (
        <span aria-hidden="true" data-card-margin-line="" style={linedMarginStyle} />
      ) : null}
    </div>
  );
});
