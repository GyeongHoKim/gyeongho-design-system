import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useClickOutside } from '../hooks/useClickOutside.js';
import { useMenuFloating } from '../hooks/useMenuFloating.js';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** One navigation link in a `NavMenu` panel. */
export interface NavMenuItem {
  /** Link target. Rendered as a real `<a href>`. */
  href: string;
  /** Visible link text. */
  label: string;
}

export interface NavMenuProps {
  /** Trigger button text. */
  label: string;
  /** Panel links. */
  items: NavMenuItem[];
  id?: string;
}

const menu = tokens.comp.menu;
const c = cssVars.comp.menu;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

/**
 * A hand-drawn site-navigation dropdown.
 *
 * A disclosure, not an action menu: a `<button aria-expanded aria-controls>`
 * trigger shows / hides a floating panel holding a plain list (`<ul>` / `<li>`)
 * of real `<a href>` links, so every entry keeps native link behaviour (open in
 * new tab, copy link address, crawlability). There is deliberately **no**
 * `role="menu"` / `role="menuitem"` anywhere — those roles are for command
 * sets (ARIA APG); use `Menu` for actions.
 *
 * Keyboard: Enter / Space on the trigger toggle the panel; ArrowDown / ArrowUp
 * on the trigger open it and focus the first / last link; Tab moves through
 * the links natively, and ArrowDown / ArrowUp / Home / End also move between
 * them; Escape closes and returns focus to the trigger. Clicking outside or
 * tabbing out closes it. Positioned with `@floating-ui/react-dom`; colours and
 * sketch parameters come from `comp.menu.*` (the same visual family as `Menu`).
 */
export const NavMenu = forwardRef<HTMLButtonElement, NavMenuProps>(function NavMenu(
  { label, items, id },
  forwardedRef,
) {
  const reactId = useId();
  const triggerId = id ?? reactId;
  const panelId = `${triggerId}-panel`;
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  // Link to focus once the panel has rendered open (set by Arrow keys on the trigger).
  const pendingFocus = useRef<'first' | 'last' | null>(null);

  const { refs, floatingStyles } = useMenuFloating(open);

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLButtonElement>({
    fillStyle: 'solid',
    roughness: menu.sketch.roughness,
    bowing: menu.sketch.bowing,
    inset: INSET,
  });

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    setHighlighted(null);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (!open || pendingFocus.current === null) {
      return;
    }
    const links = linksRef.current.slice(0, items.length);
    (pendingFocus.current === 'first' ? links[0] : links[links.length - 1])?.focus();
    pendingFocus.current = null;
  }, [open, items.length]);

  const outsideRefs = useMemo(() => [triggerRef, panelRef], []);
  useClickOutside(
    outsideRefs,
    open,
    useCallback(() => close(), [close]),
  );

  const openWithFocus = (focus: 'first' | 'last') => {
    pendingFocus.current = focus;
    if (open) {
      const links = linksRef.current.slice(0, items.length);
      (focus === 'first' ? links[0] : links[links.length - 1])?.focus();
      pendingFocus.current = null;
    } else {
      setOpen(true);
    }
  };

  // Close when focus leaves both the trigger and the panel (e.g. Tab past the
  // last link). A null relatedTarget (focus dropped onto a non-focusable area)
  // is left to the outside-click handler.
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (
      next instanceof Node &&
      !triggerRef.current?.contains(next) &&
      !panelRef.current?.contains(next)
    ) {
      close();
    }
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openWithFocus('first');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openWithFocus('last');
    } else if (event.key === 'Escape' && open) {
      // Dismiss only this disclosure, not an enclosing dialog as well.
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const links = linksRef.current.slice(0, items.length);
    const activeIndex = links.indexOf(document.activeElement as HTMLAnchorElement);
    let next: HTMLAnchorElement | null | undefined;
    switch (event.key) {
      case 'ArrowDown':
        next = links[(activeIndex + 1) % links.length];
        break;
      case 'ArrowUp':
        next = links[(activeIndex - 1 + links.length) % links.length];
        break;
      case 'Home':
        next = links[0];
        break;
      case 'End':
        next = links[links.length - 1];
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      default:
        return;
    }
    event.preventDefault();
    next?.focus();
  };

  const triggerStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.sys.spacing.xs,
    boxSizing: 'border-box',
    padding: `${menu.trigger.padding.vertical} ${menu.trigger.padding.horizontal}`,
    border: 'none',
    background: 'transparent',
    color: c.trigger.text.default,
    cursor: 'pointer',
    fontFamily: tokens.sys.typography.label.fontFamily,
    fontSize: tokens.sys.typography.label.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: String(tokens.sys.typography.label.lineHeight),
  };

  const panelStyle: CSSProperties = {
    ...floatingStyles,
    display: open ? 'block' : 'none',
    zIndex: menu.panel.zIndex,
    minWidth: '10rem',
    boxSizing: 'border-box',
    padding: menu.panel.padding,
    background: c.panel.bg,
    border: `${STROKE_WIDTH}px solid ${c.panel.stroke}`,
    borderRadius: menu.panel.radius,
    boxShadow: c.panel.shadow,
  };

  const listStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: menu.panel.gap,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  };

  const ref = mergeRefs(sketchRef, refs.setReference, triggerRef, forwardedRef);

  return (
    <>
      <button
        ref={ref}
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        style={triggerStyle}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={handleTriggerKeyDown}
        onBlur={handleBlur}
      >
        <SketchSurface
          drawable={drawable}
          width={size.width}
          height={size.height}
          strokeColor={c.trigger.stroke.default}
          strokeWidth={STROKE_WIDTH}
          fillColor={c.trigger.bg.default}
          fillRendering="fill"
        />
        <span style={{ position: 'relative' }}>{label}</span>
      </button>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: the keydown only adds Arrow/Home/End/Escape shortcuts on top of the links' native Tab order */}
      <div
        ref={mergeRefs(panelRef, refs.setFloating)}
        id={panelId}
        style={panelStyle}
        onKeyDown={handlePanelKeyDown}
        onBlur={handleBlur}
      >
        <ul style={listStyle}>
          {items.map((item, index) => (
            <li key={item.href} style={{ display: 'flex', flexDirection: 'column' }}>
              <a
                ref={(el) => {
                  linksRef.current[index] = el;
                }}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: `${menu.item.padding.vertical} ${menu.item.padding.horizontal}`,
                  borderRadius: menu.item.radius,
                  color: c.item.text.default,
                  background: highlighted === index ? c.item.bg.highlighted : c.item.bg.default,
                  fontFamily: tokens.sys.typography.body.fontFamily,
                  fontSize: tokens.sys.typography.body.fontSize,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => close()}
                onMouseEnter={() => setHighlighted(index)}
                onMouseLeave={() => setHighlighted((h) => (h === index ? null : h))}
                onFocus={() => setHighlighted(index)}
                onBlur={() => setHighlighted((h) => (h === index ? null : h))}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
});
