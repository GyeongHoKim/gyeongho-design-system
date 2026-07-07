import type { IconName } from '@ghds/icons';
import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { Icon } from './Icon.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Severity of an {@link Alert}. */
export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Severity. Defaults to `'info'`. */
  variant?: AlertVariant;
  /** Optional bold title. */
  title?: ReactNode;
  /** Message body. */
  children?: ReactNode;
  /** When provided, renders a dismiss button that calls this. */
  onDismiss?: () => void;
}

const alert = tokens.comp.alert;
const c = cssVars.comp.alert;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

const ICON: Record<AlertVariant, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'warning',
};

/**
 * A hand-drawn inline alert/banner. A sketchy box (`@ghds/sketch-core`) with a
 * severity-coloured outline and icon plus a message. Danger alerts use
 * `role="alert"` (assertive); the rest use `role="status"` (polite). Colours,
 * padding, and sketch parameters come from `@ghds/tokens` (`comp.alert.*`).
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { variant = 'info', title, children, onDismiss, style, ...rest },
  forwardedRef,
) {
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: alert.sketch.roughness,
    bowing: alert.sketch.bowing,
    inset: INSET,
  });
  const ref = mergeRefs(sketchRef, forwardedRef);

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'flex',
    alignItems: 'flex-start',
    gap: alert.gap,
    boxSizing: 'border-box',
    padding: alert.padding,
    color: c.text.body,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
    ...style,
  };

  const titleStyle: CSSProperties = {
    color: c.text.title,
    fontWeight: tokens.sys.typography.label.fontWeight,
  };

  return (
    // `role` is spread-then-overridden so the variant-derived live-region role
    // always wins over an incidental caller-supplied role.
    <div ref={ref} style={rootStyle} {...rest} role={variant === 'danger' ? 'alert' : 'status'}>
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.stroke[variant]}
        strokeWidth={STROKE_WIDTH}
        fillColor={c.bg}
        fillRendering="fill"
      />
      <span style={{ position: 'relative', display: 'inline-flex', color: c.icon[variant] }}>
        <Icon name={ICON[variant]} size="sm" />
      </span>
      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        {title !== undefined && <div style={titleStyle}>{title}</div>}
        {children !== undefined && <div>{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          style={{
            position: 'relative',
            display: 'inline-flex',
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: c.text.body,
            cursor: 'pointer',
          }}
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  );
});
