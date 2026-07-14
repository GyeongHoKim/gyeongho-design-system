import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useClickOutside } from '../hooks/useClickOutside.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { Icon } from './Icon.js';

/** A link inside a {@link NavigationMenu} dropdown panel. */
export interface NavigationMenuLink {
  label: string;
  href: string;
  description?: string;
}

/** One top-level entry in a {@link NavigationMenu}. */
export interface NavigationMenuItem {
  label: string;
  /** A direct link (renders an `<a>` with no dropdown). */
  href?: string;
  /** Dropdown links (renders a disclosure button + panel). */
  links?: NavigationMenuLink[];
  /** Marks this entry as the current section. */
  active?: boolean;
}

export interface NavigationMenuProps {
  /** The top-level navigation entries. */
  items: NavigationMenuItem[];
  /** Accessible label for the `<nav>`. */
  'aria-label'?: string;
}

const navigationMenu = tokens.comp.navigationMenu;
const c = cssVars.comp.navigationMenu;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);

/**
 * A hand-drawn navigation menu: a `<nav>` of top-level entries. A plain entry
 * renders an `<a>`; an entry with `links` renders a disclosure button that
 * opens a floating panel of links on hover/click, closing on Escape or outside
 * click. Positioned with `@floating-ui/react-dom`; colours come from
 * `@ghds/tokens` (`comp.navigationMenu.*`).
 */
export function NavigationMenu({ items, 'aria-label': ariaLabel }: NavigationMenuProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggersRef = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles } = useFloating({
    open: openIndex !== null,
    placement: 'bottom-start',
    strategy: 'fixed',
    whileElementsMounted: openIndex !== null ? autoUpdate : undefined,
    middleware: [
      offset(toPx(tokens.sys.spacing.xs)),
      flip(),
      shift({ padding: toPx(tokens.sys.spacing.sm) }),
    ],
  });

  useEffect(() => {
    if (openIndex !== null) {
      refs.setReference(triggersRef.current[openIndex] ?? null);
    }
  }, [openIndex, refs]);

  const outsideRefs = useMemo(() => [panelRef], []);
  useClickOutside(
    outsideRefs,
    openIndex !== null,
    useCallback(() => setOpenIndex(null), []),
  );

  const openLinks = openIndex !== null ? (items[openIndex]?.links ?? []) : [];

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpenIndex(index);
    } else if (event.key === 'Escape') {
      setOpenIndex(null);
    }
  };

  const navStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.sys.spacing.xs,
    fontFamily: tokens.sys.typography.label.fontFamily,
  };

  const entryStyle = (active: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.sys.spacing.xs,
    padding: `${tokens.sys.spacing.xs} ${tokens.sys.spacing.sm}`,
    border: 'none',
    borderRadius: navigationMenu.radius,
    background: 'transparent',
    color: active ? c.text.active : c.text.default,
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: tokens.sys.typography.label.fontFamily,
    fontSize: tokens.sys.typography.label.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
  });

  const panelStyle: CSSProperties = {
    ...floatingStyles,
    display: openIndex !== null ? 'flex' : 'none',
    flexDirection: 'column',
    gap: tokens.sys.spacing.xs,
    zIndex: tokens.sys.zIndex.dropdown,
    minWidth: '14rem',
    boxSizing: 'border-box',
    padding: navigationMenu.padding,
    background: c.bg,
    border: `${STROKE_WIDTH}px solid ${c.stroke}`,
    borderRadius: navigationMenu.radius,
    boxShadow: c.shadow,
  };

  return (
    <nav aria-label={ariaLabel} style={navStyle}>
      <ul
        style={{
          display: 'flex',
          gap: tokens.sys.spacing.xs,
          margin: 0,
          padding: 0,
          listStyle: 'none',
        }}
      >
        {items.map((item, index) => (
          <li key={item.label} onMouseLeave={() => openIndex === index && setOpenIndex(null)}>
            {item.links ? (
              <button
                ref={(el) => {
                  triggersRef.current[index] = el;
                }}
                type="button"
                id={`${baseId}-trigger-${index}`}
                aria-haspopup="menu"
                aria-expanded={openIndex === index}
                style={entryStyle(item.active ?? false)}
                onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
                onMouseEnter={() => setOpenIndex(index)}
                onKeyDown={(event) => handleTriggerKeyDown(event, index)}
              >
                {item.label}
                <Icon
                  name="chevron-down"
                  size="sm"
                  style={{
                    transform: openIndex === index ? 'rotate(180deg)' : undefined,
                    transition: `transform ${tokens.sys.animation.duration.fast} ${tokens.sys.animation.easing.standard}`,
                  }}
                />
              </button>
            ) : (
              <a href={item.href} style={entryStyle(item.active ?? false)}>
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>
      <div
        ref={mergeRefs(refs.setFloating, panelRef)}
        role="menu"
        aria-label={openIndex !== null ? items[openIndex]?.label : undefined}
        style={panelStyle}
        onMouseEnter={() => openIndex !== null && setOpenIndex(openIndex)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpenIndex(null);
            if (openIndex !== null) {
              triggersRef.current[openIndex]?.focus();
            }
          }
        }}
      >
        {openLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            role="menuitem"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.sys.spacing.xs,
              padding: `${tokens.sys.spacing.xs} ${tokens.sys.spacing.sm}`,
              borderRadius: navigationMenu.radius,
              color: c.text.default,
              textDecoration: 'none',
            }}
          >
            <span style={{ fontWeight: tokens.sys.typography.label.fontWeight }}>{link.label}</span>
            {link.description !== undefined && (
              <span
                style={{
                  color: tokens.sys.color.text.secondary,
                  fontSize: tokens.sys.typography.caption.fontSize,
                }}
              >
                {link.description}
              </span>
            )}
          </a>
        ))}
      </div>
    </nav>
  );
}
