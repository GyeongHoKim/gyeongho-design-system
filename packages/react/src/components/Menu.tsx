import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
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
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** One menu entry. */
export interface MenuItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MenuProps {
  /** Trigger button label. */
  label: string;
  /** Menu entries. */
  items: MenuItem[];
  /** Called with the value of the activated item. */
  onSelect?: (value: string) => void;
  /** Disables the whole menu. */
  disabled?: boolean;
  id?: string;
}

const menu = tokens.comp.menu;
const c = cssVars.comp.menu;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

/**
 * A hand-drawn menu (dropdown). A `<button>` trigger (`aria-haspopup="menu"`)
 * opens a floating `role="menu"` of `role="menuitem"`s. Keyboard: Enter / Space
 * / ArrowDown open and focus the first item; Arrow keys / Home / End move focus;
 * Enter / Space activate; Escape closes and restores focus to the trigger.
 * Positioned with `@floating-ui/react-dom`; colours and sketch parameters come
 * from `@ghds/tokens` (`comp.menu.*`).
 */
export const Menu = forwardRef<HTMLButtonElement, MenuProps>(function Menu(
  { label, items, onSelect, disabled = false, id },
  forwardedRef,
) {
  const reactId = useId();
  const menuId = id ?? reactId;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const enabledIndexes = useMemo(
    () => items.map((item, i) => ({ item, i })).filter((x) => !x.item.disabled),
    [items],
  );

  const { refs, floatingStyles } = useFloating({
    open,
    placement: 'bottom-start',
    strategy: 'fixed',
    whileElementsMounted: open ? autoUpdate : undefined,
    middleware: [
      offset(toPx(menu.panel.offset)),
      flip(),
      shift({ padding: toPx(tokens.sys.spacing.sm) }),
    ],
  });

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

  const openMenu = (index: number) => {
    setOpen(true);
    setActiveIndex(index);
  };
  const closeMenu = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  const firstEnabled = enabledIndexes[0]?.i ?? 0;
  const lastEnabled = enabledIndexes[enabledIndexes.length - 1]?.i ?? 0;

  const moveActive = (direction: 1 | -1) => {
    const positions = enabledIndexes.map((x) => x.i);
    const currentPos = positions.indexOf(activeIndex);
    const nextPos = (currentPos + direction + positions.length) % positions.length;
    const next = positions[nextPos];
    if (next !== undefined) {
      setActiveIndex(next);
    }
  };

  // Focus the active item whenever the menu is open and the active index moves.
  useEffect(() => {
    if (open) {
      itemsRef.current[activeIndex]?.focus();
    }
  }, [open, activeIndex]);

  // Close on outside pointerdown (shared with Select via useClickOutside).
  const outsideRefs = useMemo(() => [triggerRef, panelRef], []);
  useClickOutside(
    outsideRefs,
    open,
    useCallback(() => setOpen(false), []),
  );

  const select = (item: MenuItem) => {
    if (item.disabled) {
      return;
    }
    onSelect?.(item.value);
    closeMenu();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openMenu(firstEnabled);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(lastEnabled);
    }
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
        closeMenu();
        break;
      case 'Tab':
        setOpen(false);
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
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: tokens.sys.typography.label.fontFamily,
    fontSize: tokens.sys.typography.label.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: String(tokens.sys.typography.label.lineHeight),
  };

  const panelStyle: CSSProperties = {
    ...floatingStyles,
    display: open ? 'flex' : 'none',
    flexDirection: 'column',
    gap: menu.panel.gap,
    zIndex: menu.panel.zIndex,
    minWidth: '10rem',
    boxSizing: 'border-box',
    padding: menu.panel.padding,
    background: c.panel.bg,
    border: `${STROKE_WIDTH}px solid ${c.panel.stroke}`,
    borderRadius: menu.panel.radius,
    boxShadow: c.panel.shadow,
  };

  const ref = mergeRefs(sketchRef, refs.setReference, triggerRef, forwardedRef);

  return (
    <>
      <button
        ref={ref}
        type="button"
        id={menuId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${menuId}-menu`}
        disabled={disabled}
        style={triggerStyle}
        onClick={() => (open ? closeMenu(false) : openMenu(firstEnabled))}
        onKeyDown={handleTriggerKeyDown}
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
      <div
        ref={mergeRefs(panelRef, refs.setFloating)}
        id={`${menuId}-menu`}
        role="menu"
        aria-label={label}
        style={panelStyle}
        onKeyDown={handleMenuKeyDown}
      >
        {items.map((item, index) => {
          const highlighted = index === activeIndex;
          const itemStyle: CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            padding: `${menu.item.padding.vertical} ${menu.item.padding.horizontal}`,
            borderRadius: menu.item.radius,
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            color: item.disabled ? c.item.text.disabled : c.item.text.default,
            background: highlighted && !item.disabled ? c.item.bg.highlighted : c.item.bg.default,
            outline: 'none',
            fontFamily: tokens.sys.typography.body.fontFamily,
            fontSize: tokens.sys.typography.body.fontSize,
          };
          return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling lives on the parent role="menu" (Enter/Space/Arrows/Escape); items are driven by roving focus, not per-item key handlers
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
});
