import { tokens } from '@ghds/tokens';
import { type CSSProperties, type ReactNode, useId } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Edge the sheet slides in from. */
export type SheetSide = 'left' | 'right' | 'top' | 'bottom';

export interface SheetProps {
  /** Whether the sheet is shown. */
  open: boolean;
  /** Called when the user requests to close (scrim click, Escape). */
  onClose: () => void;
  /** Edge the panel is anchored to. Defaults to `'right'`. */
  side?: SheetSide;
  /** Accessible title, wired to `aria-labelledby`. */
  title?: string;
  /** Sheet body. */
  children?: ReactNode;
  /** Close when the scrim is clicked. Defaults to `true`. */
  closeOnScrimClick?: boolean;
}

const sheet = tokens.comp.sheet;
const c = cssVars.comp.sheet;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

function panelPosition(side: SheetSide): CSSProperties {
  const horizontal = side === 'left' || side === 'right';
  return horizontal
    ? {
        top: 0,
        bottom: 0,
        [side]: 0,
        height: '100%',
        width: 'min(24rem, 100%)',
      }
    : {
        left: 0,
        right: 0,
        [side]: 0,
        width: '100%',
        maxHeight: '80vh',
      };
}

/**
 * A hand-drawn side sheet. Like {@link Modal} but anchored to a screen edge
 * (`side`). Rendered through a portal with a scrim, `role="dialog"` +
 * `aria-modal`, focus trapping, Escape-to-close, scroll lock and focus
 * restoration (see {@link useFocusTrap}). Colours and sketch parameters come
 * from `@ghds/tokens` (`comp.sheet.*`).
 */
export function Sheet({
  open,
  onClose,
  side = 'right',
  title,
  children,
  closeOnScrimClick = true,
}: SheetProps) {
  const titleId = useId();
  const { containerRef, onKeyDown } = useFocusTrap<HTMLDivElement>(open, onClose);

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: sheet.sketch.roughness,
    bowing: sheet.sketch.bowing,
    inset: INSET,
  });

  if (!open) {
    return null;
  }

  const scrimStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: sheet.zIndex,
    background: c.scrim,
    opacity: tokens.sys.opacity.scrim,
  };

  const panelStyle: CSSProperties = {
    ...sketchHostStyle,
    position: 'fixed',
    zIndex: sheet.zIndex,
    boxSizing: 'border-box',
    overflow: 'auto',
    padding: sheet.padding,
    color: tokens.sys.color.text.primary,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
    ...panelPosition(side),
  };

  const titleStyle: CSSProperties = {
    position: 'relative',
    margin: `0 0 ${sheet.padding}`,
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
        data-side={side}
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
