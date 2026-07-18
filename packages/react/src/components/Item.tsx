import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** Visual treatment of an {@link Item} row. */
export type ItemVariant = 'default' | 'muted' | 'outline';

export interface ItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Surface treatment. `'default'` is transparent; `'muted'` fills a subtle
   * background; `'outline'` draws a hand-drawn border. Defaults to `'default'`.
   */
  variant?: ItemVariant;
  /** Marks the row as the selected/active one (fills the selected background). */
  selected?: boolean;
}

const item = tokens.comp.item;
const c = cssVars.comp.item;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

/**
 * A flexible list-row primitive: a horizontal band of optional leading media,
 * a growing content column, and trailing actions. Compose it with
 * {@link ItemMedia}, {@link ItemContent}, {@link ItemTitle},
 * {@link ItemDescription} and {@link ItemActions}.
 *
 * The `'outline'` variant paints a sketchy border via `@ghds/sketch-core`; all
 * colours, spacing and sketch parameters come from `@ghds/tokens`
 * (`comp.item.*`). Renders a plain `<div>` — set a role (e.g. `listitem`,
 * `option`) on the container as your composition requires.
 */
export const Item = forwardRef<HTMLDivElement, ItemProps>(function Item(
  { variant = 'default', selected = false, children, style, ...rest },
  forwardedRef,
) {
  const outline = variant === 'outline';
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    roughness: item.sketch.roughness,
    bowing: item.sketch.bowing,
    inset: INSET,
  });

  const ref = mergeRefs(sketchRef, forwardedRef);

  const background = selected ? c.bg.selected : variant === 'muted' ? c.bg.hover : undefined;

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'flex',
    alignItems: 'center',
    gap: item.gap,
    boxSizing: 'border-box',
    padding: `${item.padding.vertical} ${item.padding.horizontal}`,
    borderRadius: item.radius,
    background,
    color: c.text.title,
    fontFamily: tokens.sys.typography.body.fontFamily,
    ...style,
  };

  return (
    <div ref={ref} style={rootStyle} {...rest}>
      {outline && (
        <SketchSurface
          drawable={drawable}
          width={size.width}
          height={size.height}
          strokeColor={c.stroke.default}
          strokeWidth={STROKE_WIDTH}
        />
      )}
      {children}
    </div>
  );
});

/** Leading media slot (icon, avatar, thumbnail). */
export const ItemMedia = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ItemMedia({ children, style, ...rest }, forwardedRef) {
    const mediaStyle: CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      ...style,
    };
    return (
      <div ref={forwardedRef} style={mediaStyle} {...rest}>
        {children}
      </div>
    );
  },
);

/** Growing content column between the media and the actions. */
export const ItemContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ItemContent({ children, style, ...rest }, forwardedRef) {
    const contentStyle: CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.sys.spacing.xs,
      flex: 1,
      minWidth: 0,
      ...style,
    };
    return (
      <div ref={forwardedRef} style={contentStyle} {...rest}>
        {children}
      </div>
    );
  },
);

/** Primary line of the content column. */
export const ItemTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ItemTitle({ children, style, ...rest }, forwardedRef) {
    const titleStyle: CSSProperties = {
      color: c.text.title,
      fontFamily: tokens.sys.typography.label.fontFamily,
      fontSize: tokens.sys.typography.label.fontSize,
      fontWeight: tokens.sys.typography.label.fontWeight,
      lineHeight: String(tokens.sys.typography.label.lineHeight),
      ...style,
    };
    return (
      <div ref={forwardedRef} style={titleStyle} {...rest}>
        {children}
      </div>
    );
  },
);

/** Secondary, muted line of the content column. */
export const ItemDescription = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ItemDescription({ children, style, ...rest }, forwardedRef) {
    const descriptionStyle: CSSProperties = {
      color: c.text.description,
      fontFamily: tokens.sys.typography.caption.fontFamily,
      fontSize: tokens.sys.typography.caption.fontSize,
      fontWeight: tokens.sys.typography.caption.fontWeight,
      lineHeight: String(tokens.sys.typography.caption.lineHeight),
      ...style,
    };
    return (
      <div ref={forwardedRef} style={descriptionStyle} {...rest}>
        {children}
      </div>
    );
  },
);

/** Trailing actions slot (buttons, badges, chevrons). */
export const ItemActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ItemActions({ children, style, ...rest }, forwardedRef) {
    const actionsStyle: CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.sys.spacing.sm,
      flexShrink: 0,
      ...style,
    };
    return (
      <div ref={forwardedRef} style={actionsStyle} {...rest}>
        {children}
      </div>
    );
  },
);
