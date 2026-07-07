import { tokens } from '@ghds/tokens';
import { type CSSProperties, forwardRef, type HTMLAttributes, useState } from 'react';
import { cssVars } from '../lib/cssVars.js';
import { Icon } from './Icon.js';

/** One entry in a {@link Breadcrumb} trail. */
export interface BreadcrumbItem {
  /** Visible label. */
  label: string;
  /** Link target. Omit for a non-link entry (e.g. the current page). */
  href?: string;
}

export interface BreadcrumbProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'onSelect'> {
  /** Trail from root → current. The last item is marked as the current page. */
  items: BreadcrumbItem[];
  /** Accessible name for the nav landmark. Defaults to `'Breadcrumb'`. */
  label?: string;
  /** Fired when an item is activated (in addition to link navigation). */
  onSelect?: (item: BreadcrumbItem, index: number) => void;
}

const c = cssVars.comp.breadcrumb;
const gap = tokens.comp.breadcrumb.gap;

const listStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap,
  margin: 0,
  padding: 0,
  listStyle: 'none',
  fontFamily: tokens.sys.typography.body.fontFamily,
  fontSize: tokens.sys.typography.body.fontSize,
  lineHeight: String(tokens.sys.typography.body.lineHeight),
};

const itemStyle: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap };
const linkStyle: CSSProperties = { color: c.text.link, textDecoration: 'none' };
const linkHoverStyle: CSSProperties = { color: c.text.linkHover, textDecoration: 'none' };
const currentStyle: CSSProperties = {
  color: c.text.current,
  fontWeight: tokens.sys.typography.label.fontWeight,
};
const separatorStyle: CSSProperties = { display: 'inline-flex', color: c.separator };

/**
 * A breadcrumb navigation trail. Renders a `<nav>` landmark wrapping an ordered
 * list of links; the last item is the current page (`aria-current="page"`, not a
 * link). Colours, gap, and typography come from `@ghds/tokens`
 * (`comp.breadcrumb.*`); separators are hand-drawn chevrons from `@ghds/icons`.
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, label = 'Breadcrumb', onSelect, style, ...rest },
  ref,
) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <nav ref={ref} aria-label={label} style={style} {...rest}>
      <ol style={listStyle}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: breadcrumb items are a positional, ordered trail
            <li key={index} style={itemStyle}>
              {isLast || item.href === undefined ? (
                <span
                  style={isLast ? currentStyle : undefined}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  style={hovered === index ? linkHoverStyle : linkStyle}
                  onClick={() => onSelect?.(item, index)}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {item.label}
                </a>
              )}
              {!isLast && (
                <span style={separatorStyle} aria-hidden="true">
                  <Icon name="chevron-right" size="sm" />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
