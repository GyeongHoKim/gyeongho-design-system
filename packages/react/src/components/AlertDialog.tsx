import { tokens } from '@ghds/tokens';
import { type CSSProperties, type ReactNode, useId } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { Button } from './Button.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface AlertDialogProps {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Called when the user cancels (Cancel button or Escape). */
  onCancel: () => void;
  /** Called when the user confirms. */
  onConfirm: () => void;
  /** Accessible title, wired to `aria-labelledby`. */
  title: string;
  /** Body text, wired to `aria-describedby`. */
  description?: ReactNode;
  /** Cancel button label. Defaults to `'Cancel'`. */
  cancelLabel?: string;
  /** Confirm button label. Defaults to `'Confirm'`. */
  confirmLabel?: string;
  /** Renders the confirm action with the danger variant. Defaults to `false`. */
  destructive?: boolean;
}

const alertDialog = tokens.comp.alertDialog;
const c = cssVars.comp.alertDialog;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

/**
 * A hand-drawn alert dialog. Like {@link Modal} but `role="alertdialog"` with a
 * required title, an optional description and a Cancel/Confirm action pair.
 * Rendered through a portal with a scrim, focus trapping, Escape-to-cancel,
 * scroll lock and focus restoration (see {@link useFocusTrap}). Colours and
 * sketch parameters come from `@ghds/tokens` (`comp.alertDialog.*`).
 */
export function AlertDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  destructive = false,
}: AlertDialogProps) {
  const titleId = useId();
  const descId = useId();
  const { containerRef, onKeyDown } = useFocusTrap<HTMLDivElement>(open, onCancel);

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: alertDialog.sketch.roughness,
    bowing: alertDialog.sketch.bowing,
    inset: INSET,
  });

  if (!open) {
    return null;
  }

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: alertDialog.zIndex,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.sys.spacing.lg,
  };

  const scrimStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: c.scrim,
    opacity: tokens.sys.opacity.scrim,
  };

  const panelStyle: CSSProperties = {
    ...sketchHostStyle,
    position: 'relative',
    boxSizing: 'border-box',
    maxWidth: '28rem',
    width: '100%',
    padding: alertDialog.padding,
    color: c.text.body,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
  };

  const titleStyle: CSSProperties = {
    position: 'relative',
    margin: `0 0 ${tokens.sys.spacing.sm}`,
    color: c.text.title,
    fontFamily: tokens.sys.typography.title.fontFamily,
    fontSize: tokens.sys.typography.title.fontSize,
    fontWeight: tokens.sys.typography.title.fontWeight,
    lineHeight: String(tokens.sys.typography.title.lineHeight),
  };

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: keydown here only traps Tab / forwards Escape; the alertdialog owns focus
    <div style={overlayStyle} onKeyDown={onKeyDown}>
      <div style={scrimStyle} aria-hidden="true" />
      <div
        ref={mergeRefs(containerRef, sketchRef)}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description !== undefined ? descId : undefined}
        tabIndex={-1}
        style={panelStyle}
      >
        <SketchSurface
          drawable={drawable}
          width={size.width}
          height={size.height}
          strokeColor={destructive ? c.danger.stroke : c.stroke}
          strokeWidth={STROKE_WIDTH}
          fillColor={c.bg}
          fillRendering="fill"
          shadowColor={c.stroke}
        />
        <h2 id={titleId} style={titleStyle}>
          {title}
        </h2>
        {description !== undefined && (
          <div id={descId} style={{ position: 'relative', color: c.text.body }}>
            {description}
          </div>
        )}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: tokens.sys.spacing.sm,
            marginTop: tokens.sys.spacing.lg,
          }}
        >
          <Button variant="neutral" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
