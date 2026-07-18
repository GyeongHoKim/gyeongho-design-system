import type { IconName } from '@ghds/icons';
import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { Icon } from './Icon.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface AttachmentProps extends HTMLAttributes<HTMLDivElement> {
  /** File (or resource) name shown as the primary label. */
  name: string;
  /** Secondary metadata, e.g. a human-readable size like `"2.4 MB"`. */
  meta?: string;
  /** Optional leading icon (a `@ghds/icons` name). */
  icon?: IconName;
  /** When provided, renders a remove button that calls this handler. */
  onRemove?: () => void;
  /** Accessible label for the remove button. Defaults to `Remove {name}`. */
  removeLabel?: string;
}

const attachment = tokens.comp.attachment;
const c = cssVars.comp.attachment;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

/**
 * A hand-drawn attachment chip: an optional leading icon, a file name with
 * optional metadata, and an optional remove button. The sketchy box comes from
 * `@ghds/sketch-core`; every colour, padding, radius and sketch parameter comes
 * from `@ghds/tokens` (`comp.attachment.*`).
 */
export const Attachment = forwardRef<HTMLDivElement, AttachmentProps>(function Attachment(
  { name, meta, icon, onRemove, removeLabel, style, ...rest },
  forwardedRef,
) {
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: attachment.sketch.roughness,
    bowing: attachment.sketch.bowing,
    inset: INSET,
  });

  const ref = mergeRefs(sketchRef, forwardedRef);

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-flex',
    alignItems: 'center',
    gap: attachment.gap,
    boxSizing: 'border-box',
    padding: `${attachment.padding.vertical} ${attachment.padding.horizontal}`,
    fontFamily: tokens.sys.typography.body.fontFamily,
    ...style,
  };

  const nameStyle: CSSProperties = {
    color: c.text.name,
    fontFamily: tokens.sys.typography.label.fontFamily,
    fontSize: tokens.sys.typography.label.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: String(tokens.sys.typography.label.lineHeight),
  };

  const metaStyle: CSSProperties = {
    color: c.text.meta,
    fontFamily: tokens.sys.typography.caption.fontFamily,
    fontSize: tokens.sys.typography.caption.fontSize,
    fontWeight: tokens.sys.typography.caption.fontWeight,
    lineHeight: String(tokens.sys.typography.caption.lineHeight),
  };

  const removeButtonStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: c.icon.default,
    cursor: 'pointer',
  };

  return (
    <div ref={ref} style={rootStyle} {...rest}>
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.stroke.default}
        strokeWidth={STROKE_WIDTH}
        fillColor={c.bg.default}
        fillRendering="fill"
      />
      {icon !== undefined && (
        <span style={{ position: 'relative', color: c.icon.default, display: 'inline-flex' }}>
          <Icon name={icon} size="sm" />
        </span>
      )}
      <span style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column' }}>
        <span style={nameStyle}>{name}</span>
        {meta !== undefined && <span style={metaStyle}>{meta}</span>}
      </span>
      {onRemove !== undefined && (
        <button
          type="button"
          aria-label={removeLabel ?? `Remove ${name}`}
          style={removeButtonStyle}
          onClick={onRemove}
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  );
});
