import { tokens } from '@ghds/tokens';
import { type CSSProperties, type ReactNode, useId } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface DrawerProps {
  /** Whether the drawer is shown. */
  open: boolean;
  /** Called when the user requests to close (scrim click, Escape). */
  onClose: () => void;
  /** Accessible title, wired to `aria-labelledby`. */
  title?: string;
  /** Drawer body. */
  children?: ReactNode;
  /** Close when the scrim is clicked. Defaults to `true`. */
  closeOnScrimClick?: boolean;
}

const drawer = tokens.comp.drawer;
const c = cssVars.comp.drawer;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

/**
 * A hand-drawn bottom drawer (bottom sheet). Slides up from the bottom edge
 * with a drag-handle affordance. Rendered through a portal with a scrim,
 * `role="dialog"` + `aria-modal`, focus trapping, Escape-to-close, scroll lock
 * and focus restoration (see {@link useFocusTrap}). Colours and sketch
 * parameters come from `@ghds/tokens` (`comp.drawer.*`).
 */
export function Drawer({ open, onClose, title, children, closeOnScrimClick = true }: DrawerProps) {
  const titleId = useId();
  const { containerRef, onKeyDown } = useFocusTrap<HTMLDivElement>(open, onClose);

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: drawer.sketch.roughness,
    bowing: drawer.sketch.bowing,
    inset: INSET,
  });

  if (!open) {
    return null;
  }

  const scrimStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: drawer.zIndex,
    background: c.scrim,
    opacity: tokens.sys.opacity.scrim,
  };

  const panelStyle: CSSProperties = {
    ...sketchHostStyle,
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: drawer.zIndex,
    boxSizing: 'border-box',
    maxHeight: '85vh',
    overflow: 'auto',
    padding: drawer.padding,
    color: tokens.sys.color.text.primary,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
  };

  const handleStyle: CSSProperties = {
    position: 'relative',
    width: '2.5rem',
    height: STROKE_WIDTH * 2,
    margin: `0 auto ${tokens.sys.spacing.md}`,
    borderRadius: tokens.sys.radius.pill,
    background: tokens.sys.color.border.strong,
  };

  const titleStyle: CSSProperties = {
    position: 'relative',
    margin: `0 0 ${tokens.sys.spacing.md}`,
    color: tokens.sys.color.text.primary,
    fontFamily: tokens.sys.typography.title.fontFamily,
    fontSize: tokens.sys.typography.title.fontSize,
    fontWeight: tokens.sys.typography.title.fontWeight,
    lineHeight: String(tokens.sys.typography.title.lineHeight),
  };

  return createPortal(
    <>
      <div
        style={scrimStyle}
        aria-hidden="true"
        onClick={closeOnScrimClick ? onClose : undefined}
      />
      <div
        ref={mergeRefs(containerRef, sketchRef)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        style={panelStyle}
        onKeyDown={onKeyDown}
      >
        <SketchSurface
          drawable={drawable}
          width={size.width}
          height={size.height}
          strokeColor={c.stroke}
          strokeWidth={STROKE_WIDTH}
          fillColor={c.bg}
          fillRendering="fill"
        />
        <div style={handleStyle} aria-hidden="true" />
        {title && (
          <h2 id={titleId} style={titleStyle}>
            {title}
          </h2>
        )}
        <div style={{ position: 'relative' }}>{children}</div>
      </div>
    </>,
    document.body,
  );
}
