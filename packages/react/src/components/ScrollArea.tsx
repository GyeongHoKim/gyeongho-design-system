import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Which axis (or axes) a {@link ScrollArea} scrolls. */
export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** Scroll axis. Defaults to `'vertical'`. */
  orientation?: ScrollAreaOrientation;
}

const scrollArea = tokens.comp.scrollArea;
const c = cssVars.comp.scrollArea;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

const OVERFLOW: Record<ScrollAreaOrientation, Pick<CSSProperties, 'overflowX' | 'overflowY'>> = {
  vertical: { overflowX: 'hidden', overflowY: 'auto' },
  horizontal: { overflowX: 'auto', overflowY: 'hidden' },
  both: { overflowX: 'auto', overflowY: 'auto' },
};

/**
 * A bounded, hand-drawn scroll viewport. Draws a sketchy border
 * (`@ghds/sketch-core`) around a scrollable region whose native scrollbar is
 * themed with the standard `scrollbar-color` / `scrollbar-width` properties, so
 * the thumb and track pick up `comp.scrollArea.*` tokens without a custom
 * scrollbar overlay. Constrain the scroll region by passing `maxHeight` (or
 * `maxWidth`) via `style`.
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { orientation = 'vertical', children, style, ...rest },
  forwardedRef,
) {
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    roughness: scrollArea.sketch.roughness,
    bowing: scrollArea.sketch.bowing,
    inset: INSET,
  });

  const ref = mergeRefs(sketchRef, forwardedRef);

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    padding: tokens.sys.spacing.sm,
    ...style,
  };

  const viewportStyle: CSSProperties = {
    flex: 1,
    minHeight: 0,
    ...OVERFLOW[orientation],
    // Standard, inline-settable scrollbar theming (Firefox + Chromium 121+).
    scrollbarWidth: 'thin',
    scrollbarColor: `${c.thumb.default} ${c.track.default}`,
  };

  return (
    <div ref={ref} style={rootStyle} {...rest}>
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.thumb.default}
        strokeWidth={STROKE_WIDTH}
      />
      <div style={viewportStyle}>{children}</div>
    </div>
  );
});
