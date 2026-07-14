import { autoUpdate, flip, shift, useFloating } from '@floating-ui/react-dom';
import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
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

/** One entry in a {@link ContextMenu}. */
export interface ContextMenuItem {
  value: string;
  label: string;
  disabled?: boolean;
  /** Renders the item in the danger colour (e.g. Delete). */
  danger?: boolean;
}

export interface ContextMenuProps {
  /** The entries shown when the area is right-clicked. */
  items: ContextMenuItem[];
  /** Called with the value of the activated item. */
  onSelect?: (value: string) => void;
  /** The area that opens the menu on right-click / context-menu key. */
  children: ReactNode;
}

const contextMenu = tokens.comp.contextMenu;
const c = cssVars.comp.contextMenu;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);

/**
 * A hand-drawn context menu. Right-clicking (or the context-menu key on) the
 * wrapped area opens a floating `role="menu"` at the pointer, positioned via a
 * `@floating-ui/react-dom` virtual reference. Arrow keys / Home / End move a
 * roving focus, Enter / Space activate, Escape closes. Colours and sketch
 * parameters come from `@ghds/tokens` (`comp.contextMenu.*`).
 */
export function ContextMenu({ items, onSelect, children }: ContextMenuProps) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const coords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const areaRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const enabledIndexes = useMemo(
    () =>
      items
        .map((item, i) => ({ item, i }))
        .filter((x) => !x.item.disabled)
        .map((x) => x.i),
    [items],
  );
  const firstEnabled = enabledIndexes[0] ?? 0;
  const lastEnabled = enabledIndexes[enabledIndexes.length - 1] ?? 0;

  const { refs, floatingStyles } = useFloating({
    open,
    placement: 'right-start',
    strategy: 'fixed',
    whileElementsMounted: open ? autoUpdate : undefined,
    middleware: [flip(), shift({ padding: toPx(tokens.sys.spacing.sm) })],
  });

  // Position the menu against a zero-size virtual box at the pointer.
  const setVirtualReference = useCallback(() => {
    refs.setReference({
      getBoundingClientRect: () => {
        const { x, y } = coords.current;
        return { width: 0, height: 0, x, y, top: y, left: x, right: x, bottom: y };
      },
    });
  }, [refs]);

  const openAt = (x: number, y: number) => {
    coords.current = { x, y };
    setVirtualReference();
    setOpen(true);
    setActiveIndex(firstEnabled);
  };

  const close = () => setOpen(false);

  const outsideRefs = useMemo(() => [panelRef], []);
  useClickOutside(
    outsideRefs,
    open,
    useCallback(() => setOpen(false), []),
  );

  useEffect(() => {
    if (open) {
      itemsRef.current[activeIndex]?.focus();
    }
  }, [open, activeIndex]);

  const moveActive = (direction: 1 | -1) => {
    const positions = enabledIndexes;
    if (positions.length === 0) {
      return;
    }
    const currentPos = positions.indexOf(activeIndex);
    const nextPos = (currentPos + direction + positions.length) % positions.length;
    const next = positions[nextPos];
    if (next !== undefined) {
      setActiveIndex(next);
    }
  };

  const select = (item: ContextMenuItem) => {
    if (item.disabled) {
      return;
    }
    onSelect?.(item.value);
    close();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(firstEnabled);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(lastEnabled);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const item = items[activeIndex];
        if (item) {
          select(item);
        }
        break;
      }
    }
  };

  const panelStyle: CSSProperties = {
    ...floatingStyles,
    display: open ? 'flex' : 'none',
    flexDirection: 'column',
    gap: tokens.sys.spacing.xs,
    zIndex: contextMenu.zIndex,
    minWidth: '10rem',
    boxSizing: 'border-box',
    padding: contextMenu.padding,
    background: c.bg,
    border: `${STROKE_WIDTH}px solid ${c.stroke}`,
    borderRadius: contextMenu.radius,
    boxShadow: c.shadow,
  };

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: the area only opens the menu on contextmenu; its own contents keep their semantics */}
      <div
        ref={areaRef}
        onContextMenu={(event) => {
          event.preventDefault();
          openAt(event.clientX, event.clientY);
        }}
      >
        {children}
      </div>
      <div
        ref={mergeRefs(refs.setFloating, panelRef)}
        id={menuId}
        role="menu"
        tabIndex={-1}
        style={panelStyle}
        onKeyDown={handleMenuKeyDown}
      >
        {items.map((item, index) => {
          const highlighted = index === activeIndex;
          const itemStyle: CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            padding: `${tokens.sys.spacing.xs} ${tokens.sys.spacing.sm}`,
            borderRadius: contextMenu.radius,
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            color: item.danger ? c.item.danger : c.text,
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
              onClick={() => select(item)}
              onMouseEnter={() => !item.disabled && setActiveIndex(index)}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </>
  );
}
