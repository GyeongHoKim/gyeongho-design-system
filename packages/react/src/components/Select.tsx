import {
  autoUpdate,
  flip,
  offset,
  shift,
  size as sizeMiddleware,
  useFloating,
} from '@floating-ui/react-dom';
import { tokens } from '@ghds/tokens';
import { Label } from '@radix-ui/react-label';
import {
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { Icon } from './Icon.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

interface RegisteredOption {
  value: string;
  label: string;
  disabled: boolean;
}

interface SelectContextValue {
  readonly value: string | undefined;
  readonly highlightedValue: string | undefined;
  readonly onSelect: (value: string) => void;
  readonly onHighlight: (value: string) => void;
  readonly registerOption: (value: string, label: string, disabled: boolean) => void;
  readonly unregisterOption: (value: string) => void;
  readonly getOptionId: (value: string) => string;
}

/** Internal — read by {@link SelectOption} when rendered inside a {@link Select}. */
const SelectContext = createContext<SelectContextValue | null>(null);

export interface SelectProps {
  /** Controlled selected value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Visible label. Associated to the trigger via Radix `Label` for accessibility. */
  label?: string;
  /** Shown when nothing is selected. */
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** `SelectOption` elements. */
  children: ReactNode;
}

export interface SelectOptionProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
}

const select = tokens.comp.select;
const c = cssVars.comp.select;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const TYPEAHEAD_RESET_MS = 500;

function resolveTriggerStroke(focused: boolean, hovered: boolean, disabled: boolean): string {
  if (disabled) {
    return c.trigger.stroke.disabled;
  }
  if (focused) {
    return c.trigger.stroke.focus;
  }
  return hovered ? c.trigger.stroke.hover : c.trigger.stroke.default;
}

function resolveOptionBg(selected: boolean, highlighted: boolean): string {
  if (selected) {
    return highlighted ? c.option.bg.selectedHover : c.option.bg.selected;
  }
  return highlighted ? c.option.bg.highlighted : c.option.bg.default;
}

/**
 * A hand-drawn single-select dropdown. Unlike every other GHDS form control,
 * the trigger is a real `<button>` but the listbox panel and its keyboard
 * model are hand-implemented (no native `<select>` involved) — a real
 * `<select>`'s native dropdown UI can't be restyled to match the hand-drawn
 * aesthetic. Follows the WAI-ARIA "select-only combobox" pattern:
 * `role="combobox"` trigger + `role="listbox"` panel, with
 * `aria-activedescendant` driving a roving highlight — DOM focus never
 * leaves the trigger button while the panel is open.
 *
 * Positioned via `@floating-ui/react-dom`'s `useFloating`, `position: fixed`
 * (no portal/reparenting) — this is clipped only by an ancestor that
 * establishes a new containing block (`transform`/`filter`/`contain`), an
 * accepted v1 limitation.
 */
export function Select({
  value,
  defaultValue,
  onValueChange,
  label,
  placeholder,
  disabled = false,
  id,
  children,
}: SelectProps) {
  const reactId = useId();
  const selectId = id ?? reactId;
  const listboxId = `${selectId}-listbox`;
  const getOptionId = useCallback(
    (optionValue: string) => `${selectId}-option-${optionValue}`,
    [selectId],
  );

  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [highlightedValue, setHighlightedValue] = useState<string | undefined>(undefined);
  const optionsRef = useRef<RegisteredOption[]>([]);
  const typeaheadRef = useRef<{ buffer: string; timeout: ReturnType<typeof setTimeout> | null }>({
    buffer: '',
    timeout: null,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const { refs, floatingStyles } = useFloating({
    open,
    placement: 'bottom-start',
    strategy: 'fixed',
    // The panel is always mounted (just hidden via `display:none` — see
    // below) so `SelectOption` children can register on first render; without
    // gating on `open`, `autoUpdate`'s scroll/resize listeners would run for
    // this Select's entire mounted lifetime instead of only while it's open.
    whileElementsMounted: open ? autoUpdate : undefined,
    middleware: [
      offset(toPx(select.panel.offset)),
      flip(),
      shift({ padding: toPx(tokens.sys.spacing.sm) }),
      sizeMiddleware({
        padding: toPx(tokens.sys.spacing.sm),
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
      }),
    ],
  });

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLButtonElement>({
    fillStyle: 'solid',
    roughness: select.sketch.roughness,
    bowing: select.sketch.bowing,
    inset: INSET,
  });

  const getEnabledOptions = useCallback(
    () => optionsRef.current.filter((option) => !option.disabled),
    [],
  );

  const registerOption = useCallback(
    (optionValue: string, optionLabel: string, optionDisabled: boolean) => {
      if (!optionsRef.current.some((option) => option.value === optionValue)) {
        optionsRef.current = [
          ...optionsRef.current,
          { value: optionValue, label: optionLabel, disabled: optionDisabled },
        ];
      }
    },
    [],
  );

  const unregisterOption = useCallback((optionValue: string) => {
    optionsRef.current = optionsRef.current.filter((option) => option.value !== optionValue);
  }, []);

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (!isControlled) {
        setInternalValue(optionValue);
      }
      onValueChange?.(optionValue);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [isControlled, onValueChange],
  );

  const handleHighlight = useCallback((optionValue: string) => {
    setHighlightedValue(optionValue);
  }, []);

  const contextValue = useMemo<SelectContextValue>(
    () => ({
      value: currentValue,
      highlightedValue,
      onSelect: handleSelect,
      onHighlight: handleHighlight,
      registerOption,
      unregisterOption,
      getOptionId,
    }),
    [
      currentValue,
      highlightedValue,
      handleSelect,
      handleHighlight,
      registerOption,
      unregisterOption,
      getOptionId,
    ],
  );

  // Click-outside-to-close. `pointerdown` (capture-equivalent timing) beats
  // the trigger's own `click` handler, avoiding the classic "outside click
  // also re-triggers the trigger and reopens" bug.
  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const openWithInitialHighlight = () => {
    setOpen(true);
    const enabled = getEnabledOptions();
    if (enabled.length === 0) {
      return;
    }
    const selected =
      currentValue !== undefined && enabled.some((option) => option.value === currentValue)
        ? currentValue
        : enabled[0]?.value;
    setHighlightedValue(selected);
  };

  const highlightAt = (position: 'first' | 'last') => {
    const enabled = getEnabledOptions();
    if (enabled.length === 0) {
      return;
    }
    setHighlightedValue(
      position === 'first' ? enabled[0]?.value : enabled[enabled.length - 1]?.value,
    );
  };

  const moveHighlight = (direction: 1 | -1) => {
    const enabled = getEnabledOptions();
    if (enabled.length === 0) {
      return;
    }
    const currentIndex = enabled.findIndex((option) => option.value === highlightedValue);
    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), enabled.length - 1);
    setHighlightedValue(enabled[nextIndex]?.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (open) {
          moveHighlight(1);
        } else {
          openWithInitialHighlight();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (open) {
          moveHighlight(-1);
        } else {
          openWithInitialHighlight();
        }
        break;
      case 'Home':
        if (open) {
          event.preventDefault();
          highlightAt('first');
        }
        break;
      case 'End':
        if (open) {
          event.preventDefault();
          highlightAt('last');
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) {
          if (highlightedValue !== undefined) {
            handleSelect(highlightedValue);
          }
        } else {
          openWithInitialHighlight();
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          if (!open) {
            setOpen(true);
          }
          const typeahead = typeaheadRef.current;
          typeahead.buffer += event.key.toLowerCase();
          if (typeahead.timeout) {
            clearTimeout(typeahead.timeout);
          }
          typeahead.timeout = setTimeout(() => {
            typeahead.buffer = '';
          }, TYPEAHEAD_RESET_MS);
          const match = getEnabledOptions().find((option) =>
            option.label.toLowerCase().startsWith(typeahead.buffer),
          );
          if (match) {
            setHighlightedValue(match.value);
          }
        }
    }
  };

  const selectedOption = optionsRef.current.find((option) => option.value === currentValue);

  const fieldStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: select.trigger.gap,
    fontFamily: tokens.sys.typography.body.fontFamily,
  };

  const labelStyle: CSSProperties = {
    color: c.trigger.text.label,
    fontFamily: tokens.sys.typography.label.fontFamily,
    fontSize: tokens.sys.typography.label.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: String(tokens.sys.typography.label.lineHeight),
  };

  const triggerStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: select.trigger.gap,
    boxSizing: 'border-box',
    width: '100%',
    margin: 0,
    padding: `${select.trigger.padding.vertical} ${select.trigger.padding.horizontal}`,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: disabled ? c.trigger.text.disabled : c.trigger.text.value,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    fontWeight: tokens.sys.typography.body.fontWeight,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const panelStyle: CSSProperties = {
    ...floatingStyles,
    // Always mounted (see the render below) so `SelectOption` children register
    // themselves on first render and the trigger can show the selected label
    // before the panel has ever been opened — visibility is toggled here rather
    // than by conditionally rendering the panel at all.
    display: open ? 'flex' : 'none',
    zIndex: select.panel.zIndex,
    background: c.panel.bg,
    border: `${STROKE_WIDTH}px solid ${c.panel.stroke}`,
    borderRadius: select.panel.radius,
    boxShadow: c.panel.shadow,
    padding: select.panel.padding,
    flexDirection: 'column',
    gap: select.panel.gap,
    boxSizing: 'border-box',
    overflowY: 'auto',
  };

  const ref = mergeRefs(sketchRef, refs.setReference, triggerRef);

  return (
    <div style={fieldStyle}>
      {label !== undefined && (
        <Label htmlFor={selectId} style={labelStyle}>
          {label}
        </Label>
      )}
      <button
        ref={ref}
        id={selectId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={
          open && highlightedValue !== undefined ? getOptionId(highlightedValue) : undefined
        }
        disabled={disabled}
        style={triggerStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={() => setOpen((next) => !next)}
        onKeyDown={handleKeyDown}
      >
        <SketchSurface
          drawable={drawable}
          width={size.width}
          height={size.height}
          strokeColor={resolveTriggerStroke(focused, hovered, disabled)}
          strokeWidth={STROKE_WIDTH}
          fillColor={disabled ? c.trigger.bg.disabled : c.trigger.bg.default}
          fillRendering="fill"
        />
        <span>{selectedOption?.label ?? placeholder}</span>
        <Icon
          name="chevron-down"
          size="sm"
          style={{
            transform: open ? 'rotate(180deg)' : undefined,
            transition: `transform ${tokens.sys.animation.duration.fast} ${tokens.sys.animation.easing.standard}`,
          }}
        />
      </button>
      <div
        ref={mergeRefs(panelRef, refs.setFloating)}
        id={listboxId}
        role="listbox"
        aria-label={label}
        style={panelStyle}
      >
        <SelectContext.Provider value={contextValue}>{children}</SelectContext.Provider>
      </div>
    </div>
  );
}

/**
 * One option inside a {@link Select}. Has no standalone meaning outside an
 * open `Select` panel — no native element backs it, and its highlight/
 * selected state is entirely driven by the parent's context.
 */
export function SelectOption({ value, disabled = false, children }: SelectOptionProps) {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error('SelectOption must be rendered inside a Select');
  }

  // Only a plain string `children` gives a meaningful typeahead label — for
  // JSX children (e.g. an icon + text), `String(children)` would stringify to
  // `"[object Object]"` and silently break/collide typeahead matching, so this
  // option is simply excluded from typeahead instead (a graceful v1
  // degradation, not a workaround for an error case).
  const labelText = typeof children === 'string' ? children : '';

  useEffect(() => {
    ctx.registerOption(value, labelText, disabled);
    return () => ctx.unregisterOption(value);
  }, [ctx, value, labelText, disabled]);

  const isSelected = ctx.value === value;
  const isHighlighted = ctx.highlightedValue === value;

  const optionStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: `${select.option.padding.vertical} ${select.option.padding.horizontal}`,
    borderRadius: select.option.radius,
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: disabled
      ? c.option.text.disabled
      : isSelected
        ? c.option.text.selected
        : c.option.text.default,
    background: disabled ? c.option.bg.default : resolveOptionBg(isSelected, isHighlighted),
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: intentionally not a keyboard focus target — Select's aria-activedescendant pattern keeps real DOM focus on the trigger button; Enter/Space there select the highlighted option.
    // biome-ignore lint/a11y/useFocusableInteractive: same reason — options are never individually focusable by design (aria-activedescendant, not roving tabindex).
    <div
      id={ctx.getOptionId(value)}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      style={optionStyle}
      onClick={() => {
        if (!disabled) {
          ctx.onSelect(value);
        }
      }}
      onMouseEnter={() => {
        if (!disabled) {
          ctx.onHighlight(value);
        }
      }}
    >
      {children}
    </div>
  );
}
