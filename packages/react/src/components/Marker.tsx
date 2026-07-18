import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Highlight tone of a {@link Marker}. */
export type MarkerVariant = 'default' | 'success' | 'info' | 'danger';

export interface MarkerProps extends HTMLAttributes<HTMLElement> {
  /** Highlight colour. Defaults to `'default'` (a warm highlighter yellow). */
  variant?: MarkerVariant;
}

const c = cssVars.comp.marker;
const FILL_STROKE_WIDTH = toPx(tokens.sys.border.width.thick);

/**
 * A hand-drawn highlighter. Wraps inline text in a semantic `<mark>` and paints
 * a sketchy hachure stroke behind it (`@ghds/sketch-core`), so the words stay
 * readable through the scribble. The highlight colour comes from
 * `@ghds/tokens` (`comp.marker.*`); the text colour is inherited, never set.
 */
export const Marker = forwardRef<HTMLElement, MarkerProps>(function Marker(
  { variant = 'default', children, style, ...rest },
  forwardedRef,
) {
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLElement>({
    fillStyle: 'hachure',
    roughness: tokens.comp.marker.sketch.roughness,
    bowing: tokens.comp.marker.sketch.bowing,
    hachureGap: tokens.sys.sketch.hachureGap,
    hachureAngle: tokens.sys.sketch.hachureAngle,
  });

  const ref = mergeRefs(sketchRef, forwardedRef);

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline',
    background: 'transparent',
    color: 'inherit',
    // A little horizontal breathing room so the scribble overshoots the glyphs.
    padding: `0 ${tokens.sys.spacing.xs}`,
    ...style,
  };

  return (
    <mark ref={ref} style={rootStyle} {...rest}>
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.color[variant]}
        strokeWidth={FILL_STROKE_WIDTH}
        fillColor={c.color[variant]}
        fillRendering="stroke"
        fillStrokeWidth={FILL_STROKE_WIDTH}
      />
      <span style={{ position: 'relative' }}>{children}</span>
    </mark>
  );
});
