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
import type { MenuItem } from './Menu.js';

/** One top-level menu in a {@link Menubar}. */
export interface MenubarMenu {
  label: string;
  items: MenuItem[];
}

export interface MenubarProps {
  /** The top-level menus. */
  menus: MenubarMenu[];
  /** Called with the value of the activated item. */
  onSelect?: (value: string) => void;
  /** Accessible label for the menubar. */
  'aria-label'?: string;
}

const menubar = tokens.comp.menubar;
const c = cssVars.comp.menubar;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);

/**
 * A hand-drawn menubar: a horizontal `role="menubar"` of menu buttons, each
 * opening a `role="menu"` dropdown. ArrowLeft/Right move between menus (and
 * switch the open one), ArrowDown/Enter opens and focuses the first item,
 * ArrowUp/Down move within a menu, Escape closes. Positioned with
 * `@floating-ui/react-dom`; colours come from `@ghds/tokens` (`comp.menubar.*`).
 */
export function Menubar({ menus, onSelect, 'aria-label': ariaLabel }: MenubarProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [focusedTrigger, setFocusedTrigger] = useState(0);
  const [activeItem, setActiveItem] = useState(0);

  const triggersRef = useRef<(HTMLButtonElement | null)[]>([]);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
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

  // Anchor the shared dropdown to whichever trigger is open.
  useEffect(() => {
    if (openIndex !== null) {
      refs.setReference(triggersRef.current[openIndex] ?? null);
    }
  }, [openIndex, refs]);

  const openMenu = (index: number) => {
    setOpenIndex(index);
    setFocusedTrigger(index);
    setActiveItem(0);
  };
  const closeMenu = (restoreFocus = true) => {
    const index = openIndex;
    setOpenIndex(null);
    if (restoreFocus && index !== null) {
      triggersRef.current[index]?.focus();
    }
  };

  const outsideRefs = useMemo(() => [panelRef], []);
  useClickOutside(
    outsideRefs,
    openIndex !== null,
    useCallback(() => setOpenIndex(null), []),
  );

  const currentItems = openIndex !== null ? (menus[openIndex]?.items ?? []) : [];
  const enabledItems = useMemo(
    () =>
      currentItems
        .map((item, i) => ({ item, i }))
        .filter((x) => !x.item.disabled)
        .map((x) => x.i),
    [currentItems],
  );

  useEffect(() => {
    if (openIndex !== null) {
      itemsRef.current[activeItem]?.focus();
    }
  }, [openIndex, activeItem]);

  const moveTrigger = (direction: 1 | -1) => {
    const next = (focusedTrigger + direction + menus.length) % menus.length;
    setFocusedTrigger(next);
    if (openIndex !== null) {
      openMenu(next);
    } else {
      triggersRef.current[next]?.focus();
    }
  };

  const moveItem = (direction: 1 | -1) => {
    if (enabledItems.length === 0) {
      return;
    }
    const pos = enabledItems.indexOf(activeItem);
    const nextPos = (pos + direction + enabledItems.length) % enabledItems.length;
    const next = enabledItems[nextPos];
    if (next !== undefined) {
      setActiveItem(next);
    }
  };

  const selectItem = (item: MenuItem) => {
    if (item.disabled) {
      return;
    }
    onSelect?.(item.value);
    closeMenu();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        moveTrigger(1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveTrigger(-1);
        break;
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        event.preventDefault();
        openMenu(index);
        break;
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveItem(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveItem(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveTrigger(1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveTrigger(-1);
        break;
      case 'Escape':
        event.preventDefault();
        closeMenu();
        break;
      case 'Tab':
        setOpenIndex(null);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const item = currentItems[activeItem];
        if (item) {
          selectItem(item);
        }
        break;
      }
    }
  };

  const barStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.sys.spacing.xs,
    boxSizing: 'border-box',
    padding: menubar.padding,
    background: c.bg,
    border: `${STROKE_WIDTH}px solid ${c.stroke}`,
    borderRadius: menubar.radius,
  };

  const panelStyle: CSSProperties = {
    ...floatingStyles,
    display: openIndex !== null ? 'flex' : 'none',
    flexDirection: 'column',
    gap: tokens.sys.spacing.xs,
    zIndex: tokens.sys.zIndex.dropdown,
    minWidth: '10rem',
    boxSizing: 'border-box',
    padding: menubar.padding,
    background: c.bg,
    border: `${STROKE_WIDTH}px solid ${c.stroke}`,
    borderRadius: menubar.radius,
  };

  return (
    <>
      <div role="menubar" aria-label={ariaLabel} style={barStyle}>
        {menus.map((menu, index) => {
          const triggerStyle: CSSProperties = {
            padding: `${tokens.sys.spacing.xs} ${tokens.sys.spacing.sm}`,
            border: 'none',
            borderRadius: menubar.radius,
            background: openIndex === index ? c.item.hover : 'transparent',
            color: c.text,
            cursor: 'pointer',
            fontFamily: tokens.sys.typography.label.fontFamily,
            fontSize: tokens.sys.typography.label.fontSize,
            fontWeight: tokens.sys.typography.label.fontWeight,
          };
          return (
            <button
              key={menu.label}
              ref={(el) => {
                triggersRef.current[index] = el;
              }}
              type="button"
              role="menuitem"
              id={`${baseId}-trigger-${index}`}
              aria-haspopup="menu"
              aria-expanded={openIndex === index}
              tabIndex={index === focusedTrigger ? 0 : -1}
              style={triggerStyle}
              onClick={() => (openIndex === index ? closeMenu(false) : openMenu(index))}
              onFocus={() => setFocusedTrigger(index)}
              onKeyDown={(event) => handleTriggerKeyDown(event, index)}
            >
              {menu.label}
            </button>
          );
        })}
      </div>
      <div
        ref={mergeRefs(refs.setFloating, panelRef)}
        role="menu"
        aria-label={openIndex !== null ? menus[openIndex]?.label : undefined}
        style={panelStyle}
        onKeyDown={handleMenuKeyDown}
      >
        {currentItems.map((item, index) => {
          const highlighted = index === activeItem;
          const itemStyle: CSSProperties = {
            padding: `${tokens.sys.spacing.xs} ${tokens.sys.spacing.sm}`,
            borderRadius: menubar.radius,
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            color: c.text,
            opacity: item.disabled ? 0.5 : 1,
            background: highlighted && !item.disabled ? c.item.hover : 'transparent',
            outline: 'none',
            fontFamily: tokens.sys.typography.body.fontFamily,
            fontSize: tokens.sys.typography.body.fontSize,
          };
          return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling lives on the parent role="menu"; items use roving focus
            <div
              key={item.value}
              ref={(el) => {
                itemsRef.current[index] = el;
              }}
              role="menuitem"
              tabIndex={-1}
              aria-disabled={item.disabled || undefined}
              style={itemStyle}
              onClick={() => selectItem(item)}
              onMouseEnter={() => !item.disabled && setActiveItem(index)}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </>
  );
}
