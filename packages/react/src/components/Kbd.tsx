import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface KbdProps extends HTMLAttributes<HTMLElement> {}

const kbd = tokens.comp.kbd;
const c = cssVars.comp.kbd;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

/**
 * A hand-drawn keyboard key. Renders a `<kbd>` with a sketchy outline + fill
 * (`@ghds/sketch-core`); every colour, padding and sketch parameter comes from
 * `@ghds/tokens` (`comp.kbd.*`). The SVG is decorative (`aria-hidden`); the
 * `<kbd>` element carries the semantics.
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { children, style, ...rest },
  forwardedRef,
) {
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLElement>({
    fillStyle: 'solid',
    roughness: kbd.sketch.roughness,
    bowing: kbd.sketch.bowing,
    inset: INSET,
  });

  const ref = mergeRefs(sketchRef, forwardedRef);

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    minWidth: '1.5em',
    padding: `${kbd.padding.vertical} ${kbd.padding.horizontal}`,
    color: c.text,
    fontFamily: tokens.sys.typography.code.fontFamily,
    fontSize: tokens.sys.typography.caption.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    ...style,
  };

  return (
    <kbd ref={ref} style={rootStyle} {...rest}>
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.stroke}
        strokeWidth={STROKE_WIDTH}
        fillColor={c.bg}
        fillRendering="fill"
      />
      <span style={{ position: 'relative' }}>{children}</span>
    </kbd>
  );
});
