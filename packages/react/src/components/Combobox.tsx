import {
  autoUpdate,
  flip,
  offset,
  shift,
  size as sizeMiddleware,
  useFloating,
} from '@floating-ui/react-dom';
import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
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
import { Label } from './Label.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** One selectable option in a {@link Combobox}. */
export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  /** The options to filter and choose from. */
  options: ComboboxOption[];
  /** Controlled selected value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the selected option value. */
  onValueChange?: (value: string) => void;
  /** Visible label, associated to the input. */
  label?: string;
  /** Placeholder shown when the input is empty. */
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** Text shown when no option matches the query. */
  emptyMessage?: string;
}

const combobox = tokens.comp.combobox;
const c = cssVars.comp.combobox;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

/**
 * A hand-drawn searchable combobox (WAI-ARIA editable combobox + listbox). A
 * real `<input role="combobox">` filters a `role="listbox"` of options; DOM
 * focus stays on the input while `aria-activedescendant` drives a roving
 * highlight. ArrowUp/Down move the highlight, Enter selects, Escape closes.
 * Positioned with `@floating-ui/react-dom`; colours and sketch parameters come
 * from `@ghds/tokens` (`comp.combobox.*`).
 */
export function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  placeholder,
  disabled = false,
  id,
  emptyMessage = 'No results',
}: ComboboxProps) {
  const reactId = useId();
  const comboId = id ?? reactId;
  const listboxId = `${comboId}-listbox`;
  const getOptionId = useCallback(
    (optionValue: string) => `${comboId}-option-${optionValue}`,
    [comboId],
  );

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const currentValue = isControlled ? value : internalValue;

  const selectedOption = options.find((o) => o.value === currentValue);
  const [query, setQuery] = useState(selectedOption?.label ?? '');
  // Whether the user has edited the input since the last selection — while
  // false the full option list shows (the selected label isn't a filter).
  const [dirty, setDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!dirty || query === '') {
      return options;
    }
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, dirty]);

  const { refs, floatingStyles } = useFloating({
    open,
    placement: 'bottom-start',
    strategy: 'fixed',
    whileElementsMounted: open ? autoUpdate : undefined,
    middleware: [
      offset(toPx(tokens.sys.spacing.xs)),
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
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: combobox.sketch.roughness,
    bowing: combobox.sketch.bowing,
    inset: INSET,
  });

  const outsideRefs = useMemo(() => [wrapperRef, panelRef], []);
  useClickOutside(
    outsideRefs,
    open,
    useCallback(() => {
      setOpen(false);
      // Restore the selected label so a partial query isn't left behind.
      setQuery(options.find((o) => o.value === currentValue)?.label ?? '');
      setDirty(false);
    }, [options, currentValue]),
  );

  const enabledFiltered = filtered.filter((o) => !o.disabled);

  const commit = (option: ComboboxOption) => {
    if (option.disabled) {
      return;
    }
    if (!isControlled) {
      setInternalValue(option.value);
    }
    onValueChange?.(option.value);
    setQuery(option.label);
    setDirty(false);
    setOpen(false);
  };

  const moveHighlight = (direction: 1 | -1) => {
    if (enabledFiltered.length === 0) {
      return;
    }
    const currentOption = filtered[highlightIndex];
    const currentPos = currentOption
      ? enabledFiltered.findIndex((o) => o.value === currentOption.value)
      : -1;
    const nextPos = Math.min(Math.max(currentPos + direction, 0), enabledFiltered.length - 1);
    const nextOption = enabledFiltered[nextPos];
    if (nextOption) {
      setHighlightIndex(filtered.findIndex((o) => o.value === nextOption.value));
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          moveHighlight(1);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (open) {
          moveHighlight(-1);
        }
        break;
      case 'Enter': {
        if (open) {
          event.preventDefault();
          const option = filtered[highlightIndex];
          if (option) {
            commit(option);
          }
        }
        break;
      }
      case 'Escape':
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
    }
  };

  const highlightedValue = filtered[highlightIndex]?.value;

  const fieldStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: tokens.sys.spacing.xs,
    fontFamily: tokens.sys.typography.body.fontFamily,
  };

  const inputWrapStyle: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    minWidth: '14rem',
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    margin: 0,
    padding: `${combobox.padding.vertical} ${combobox.padding.horizontal}`,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: c.text,
    cursor: disabled ? 'not-allowed' : 'text',
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
  };

  const panelStyle: CSSProperties = {
    ...floatingStyles,
    display: open ? 'flex' : 'none',
    flexDirection: 'column',
    gap: tokens.sys.spacing.xs,
    zIndex: tokens.sys.zIndex.dropdown,
    boxSizing: 'border-box',
    padding: tokens.sys.spacing.xs,
    background: c.listbox.bg,
    border: `${STROKE_WIDTH}px solid ${c.stroke.default}`,
    borderRadius: combobox.radius,
    overflowY: 'auto',
  };

  return (
    <div style={fieldStyle}>
      {label !== undefined && <Label htmlFor={comboId}>{label}</Label>}
      <div ref={mergeRefs(refs.setReference, sketchRef, wrapperRef)} style={inputWrapStyle}>
        <SketchSurface
          drawable={drawable}
          width={size.width}
          height={size.height}
          strokeColor={focused ? c.stroke.focus : c.stroke.default}
          strokeWidth={STROKE_WIDTH}
          fillColor={c.bg}
          fillRendering="fill"
        />
        <input
          ref={inputRef}
          id={comboId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={
            open && highlightedValue !== undefined ? getOptionId(highlightedValue) : undefined
          }
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          style={inputStyle}
          onChange={(e) => {
            setQuery(e.target.value);
            setDirty(true);
            setOpen(true);
            setHighlightIndex(0);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onClick={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div
        ref={mergeRefs(panelRef, refs.setFloating)}
        id={listboxId}
        role="listbox"
        aria-label={label}
        style={panelStyle}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: combobox.padding.vertical, color: c.text, opacity: 0.7 }}>
            {emptyMessage}
          </div>
        ) : (
          filtered.map((option, index) => {
            const selected = option.value === currentValue;
            const highlighted = index === highlightIndex;
            const optionStyle: CSSProperties = {
              padding: `${combobox.padding.vertical} ${combobox.padding.horizontal}`,
              borderRadius: combobox.radius,
              cursor: option.disabled ? 'not-allowed' : 'pointer',
              color: c.text,
              opacity: option.disabled ? 0.5 : 1,
              background: selected
                ? c.option.selected
                : highlighted
                  ? c.option.hover
                  : 'transparent',
            };
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling lives on the input (aria-activedescendant); options are pointer targets only
              // biome-ignore lint/a11y/useFocusableInteractive: options are never focused — DOM focus stays on the combobox input by design
              <div
                key={option.value}
                id={getOptionId(option.value)}
                role="option"
                aria-selected={selected}
                aria-disabled={option.disabled || undefined}
                style={optionStyle}
                onMouseDown={(e) => {
                  // Prevent the input from blurring (which would close the panel)
                  // before the click selects.
                  e.preventDefault();
                }}
                onClick={() => commit(option)}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                {option.label}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
