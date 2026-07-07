import { tokens } from '@ghds/tokens';
import { type CSSProperties, type ReactNode, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface ModalProps {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Called when the user requests to close (scrim click, Escape). */
  onClose: () => void;
  /** Accessible title, rendered as a heading and wired to `aria-labelledby`. */
  title?: string;
  /** Dialog body. */
  children?: ReactNode;
  /** Close when the scrim is clicked. Defaults to `true`. */
  closeOnScrimClick?: boolean;
}

const modal = tokens.comp.modal;
const c = cssVars.comp.modal;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * A hand-drawn modal dialog. Renders through a portal on `document.body` with a
 * scrim, a sketchy panel (`@ghds/sketch-core`), `role="dialog"` +
 * `aria-modal="true"`, focus trapping (Tab cycles within the dialog), focus
 * restoration to the previously-focused element on close, Escape-to-close, and
 * body scroll lock. Colours and sketch parameters come from `@ghds/tokens`
 * (`comp.modal.*`).
 */
export function Modal({ open, onClose, title, children, closeOnScrimClick = true }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: modal.sketch.roughness,
    bowing: modal.sketch.bowing,
    inset: INSET,
  });
  const ref = mergeRefs(panelRef, sketchRef);

  useEffect(() => {
    if (!open) {
      return;
    }
    previousFocus.current = (document.activeElement as HTMLElement) ?? null;
    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
    (focusables && focusables.length > 0 ? focusables[0] : panel)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus?.();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    const focusables = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (focusables.length === 0) {
      // Nothing focusable inside — keep focus on the dialog.
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    // The panel itself (tabIndex=-1) receives focus when a non-focusable body
    // element is clicked; treat it like the pre-first position so Shift+Tab
    // wraps to the end instead of escaping the portal.
    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: modal.zIndex,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.sys.spacing.lg,
  };

  const scrimStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: c.scrim.color,
    opacity: modal.scrim.opacity,
  };

  const panelStyle: CSSProperties = {
    ...sketchHostStyle,
    position: 'relative',
    boxSizing: 'border-box',
    maxWidth: '32rem',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: modal.panel.padding,
    color: c.text.body,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
  };

  const titleStyle: CSSProperties = {
    position: 'relative',
    margin: `0 0 ${modal.panel.gap}`,
    color: c.text.title,
    fontFamily: tokens.sys.typography.title.fontFamily,
    fontSize: tokens.sys.typography.title.fontSize,
    fontWeight: tokens.sys.typography.title.fontWeight,
    lineHeight: String(tokens.sys.typography.title.lineHeight),
  };

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: keydown here only traps Tab / forwards Escape for the dialog; the dialog itself owns focus
    <div style={overlayStyle} onKeyDown={handleKeyDown}>
      <div
        style={scrimStyle}
        aria-hidden="true"
        onClick={closeOnScrimClick ? onClose : undefined}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        style={panelStyle}
      >
        <SketchSurface
          drawable={drawable}
          width={size.width}
          height={size.height}
          strokeColor={c.panel.stroke}
          strokeWidth={STROKE_WIDTH}
          fillColor={c.panel.bg}
          fillRendering="fill"
        />
        {title && (
          <h2 id={titleId} style={titleStyle}>
            {title}
          </h2>
        )}
        <div style={{ position: 'relative' }}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
