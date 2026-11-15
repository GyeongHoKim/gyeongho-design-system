import type { IconName } from '@ghds/icons';
import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { Icon } from './Icon.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Kind of a {@link Callout} aside. */
export type CalloutVariant = 'info' | 'tip' | 'warning';

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  /** Kind of aside. Defaults to `'info'`. */
  variant?: CalloutVariant;
  /** Optional bold heading shown above the body. */
  heading?: ReactNode;
  /** Body content. */
  children: ReactNode;
}

const callout = tokens.comp.callout;
const c = cssVars.comp.callout;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

const ICON: Record<CalloutVariant, IconName> = {
  info: 'info',
  tip: 'star',
  warning: 'warning',
};

/**
 * A hand-drawn, static aside for documentation and other long-form content (a
 * note, a tip, a caveat). A sketchy box (`@ghds/sketch-core`) with a
 * variant-coloured outline and icon, an optional heading, and a body.
 *
 * Unlike {@link Alert} it is not a live region and cannot be dismissed: it
 * renders `role="note"` (overridable through props). Colours, padding, and
 * sketch parameters come from `@ghds/tokens` (`comp.callout.*`).
 */
export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { variant = 'info', heading, children, style, ...rest },
  forwardedRef,
) {
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: callout.sketch.roughness,
    bowing: callout.sketch.bowing,
    inset: INSET,
  });
  const ref = mergeRefs(sketchRef, forwardedRef);

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'flex',
    alignItems: 'flex-start',
    gap: callout.gap,
    boxSizing: 'border-box',
    padding: callout.padding,
    color: c.text.body,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
    ...style,
  };

  const headingStyle: CSSProperties = {
    color: c.text.heading,
    fontWeight: tokens.sys.typography.label.fontWeight,
  };

  return (
    <div ref={ref} role="note" data-variant={variant} style={rootStyle} {...rest}>
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.stroke[variant]}
        strokeWidth={STROKE_WIDTH}
        fillColor={c.bg}
        fillRendering="fill"
      />
      <span
        data-callout-icon=""
        style={{ position: 'relative', display: 'inline-flex', color: c.icon[variant] }}
      >
        <Icon name={ICON[variant]} size="sm" />
      </span>
      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        {heading !== undefined && heading !== null && heading !== false && heading !== '' && (
          <div style={headingStyle}>{heading}</div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
});
