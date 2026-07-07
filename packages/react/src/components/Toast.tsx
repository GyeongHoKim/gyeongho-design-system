import type { IconName } from '@ghds/icons';
import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type ReactNode, useEffect, useRef } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { Icon } from './Icon.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Severity of a {@link Toast}. */
export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastProps {
  /** Whether the toast is shown. */
  open: boolean;
  /** Called on auto-dismiss or when the close button is pressed. */
  onClose: () => void;
  /** Severity. Defaults to `'info'`. */
  variant?: ToastVariant;
  /** Optional bold title. */
  title?: ReactNode;
  /** Message body. */
  children?: ReactNode;
  /** Auto-dismiss after this many ms; `0` to persist. Defaults to 5000. */
  duration?: number;
}

const toast = tokens.comp.toast;
const c = cssVars.comp.toast;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
// Auto-dismiss timeout is a behavioural timing (like Select's typeahead reset),
// not a motion token — kept as a component default.
const DEFAULT_DURATION = 5000;

const ICON: Record<ToastVariant, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'warning',
};

/**
 * A hand-drawn toast notification: a sketchy, elevated box (`@ghds/sketch-core`)
 * that appears fixed to the bottom-right and auto-dismisses after `duration`.
 * `danger` uses `role="alert"` (assertive); the rest use `role="status"`
 * (polite). Controlled via `open`/`onClose`; stack multiple toasts by rendering
 * several. Colours and sketch parameters come from `@ghds/tokens`
 * (`comp.toast.*`).
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { open, onClose, variant = 'info', title, children, duration = DEFAULT_DURATION },
  forwardedRef,
) {
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: toast.sketch.roughness,
    bowing: toast.sketch.bowing,
    inset: INSET,
  });
  const ref = mergeRefs(sketchRef, forwardedRef);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open || duration <= 0) {
      return;
    }
    const timer = setTimeout(() => onCloseRef.current(), duration);
    return () => clearTimeout(timer);
  }, [open, duration]);

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    position: 'fixed',
    right: tokens.sys.spacing.lg,
    bottom: tokens.sys.spacing.lg,
    zIndex: toast.zIndex,
    display: 'flex',
    alignItems: 'flex-start',
    gap: toast.gap,
    boxSizing: 'border-box',
    maxWidth: '24rem',
    padding: toast.padding,
    color: c.text.body,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
  };

  // The live region stays mounted (empty when closed) so a polite `status`
  // announcement fires when the message is inserted on open, rather than the
  // region appearing already-populated.
  const closedStyle: CSSProperties = {
    position: 'fixed',
    width: 0,
    height: 0,
    overflow: 'hidden',
  };

  return (
    <div
      ref={ref}
      role={variant === 'danger' ? 'alert' : 'status'}
      aria-live={variant === 'danger' ? 'assertive' : 'polite'}
      style={open ? rootStyle : closedStyle}
    >
      {open && (
        <>
          <SketchSurface
            drawable={drawable}
            width={size.width}
            height={size.height}
            strokeColor={c.stroke[variant]}
            strokeWidth={STROKE_WIDTH}
            fillColor={c.bg}
            fillRendering="fill"
            shadowColor={c.stroke[variant]}
          />
          <span style={{ position: 'relative', display: 'inline-flex', color: c.icon[variant] }}>
            <Icon name={ICON[variant]} size="sm" />
          </span>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            {title !== undefined && (
              <div
                style={{ color: c.text.title, fontWeight: tokens.sys.typography.label.fontWeight }}
              >
                {title}
              </div>
            )}
            {children !== undefined && <div>{children}</div>}
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={onClose}
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
        </>
      )}
    </div>
  );
});
