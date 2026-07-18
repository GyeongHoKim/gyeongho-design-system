import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Who sent the message a {@link Bubble} holds. */
export type BubbleVariant = 'received' | 'sent';

export interface BubbleProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `'received'` (default) is a muted incoming bubble; `'sent'` is a filled
   * outgoing bubble in the primary colour.
   */
  variant?: BubbleVariant;
}

const bubble = tokens.comp.bubble;
const c = cssVars.comp.bubble;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

/**
 * A hand-drawn chat bubble. The sketchy rounded box (outline + fill) comes from
 * `@ghds/sketch-core`; colour, padding, radius and sketch parameters come from
 * `@ghds/tokens` (`comp.bubble.*`). Alignment within a conversation is the
 * caller's concern (see {@link Message}); the bubble only paints itself.
 */
export const Bubble = forwardRef<HTMLDivElement, BubbleProps>(function Bubble(
  { variant = 'received', children, style, ...rest },
  forwardedRef,
) {
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: bubble.sketch.roughness,
    bowing: bubble.sketch.bowing,
    inset: INSET,
  });

  const ref = mergeRefs(sketchRef, forwardedRef);

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-block',
    boxSizing: 'border-box',
    maxWidth: '100%',
    padding: `${bubble.padding.vertical} ${bubble.padding.horizontal}`,
    color: c.text[variant],
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
        strokeColor={c.stroke[variant]}
        strokeWidth={STROKE_WIDTH}
        fillColor={c.bg[variant]}
        fillRendering="fill"
      />
      <span style={{ position: 'relative' }}>{children}</span>
    </div>
  );
});
