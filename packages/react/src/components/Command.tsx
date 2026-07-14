import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cssVars } from '../lib/cssVars.js';
import { toPx } from '../lib/units.js';
import { Icon } from './Icon.js';
import { Modal } from './Modal.js';

/** A single runnable command. */
export interface CommandItem {
  value: string;
  label: string;
  /** Extra terms matched by the filter (not shown). */
  keywords?: string[];
  disabled?: boolean;
}

/** A titled group of {@link CommandItem}s. */
export interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

export interface CommandProps {
  /** The grouped commands. */
  groups: CommandGroup[];
  /** Called with the value of the chosen command. */
  onSelect?: (value: string) => void;
  /** Search input placeholder. */
  placeholder?: string;
  /** Shown when the query matches nothing. */
  emptyMessage?: string;
  /** Accessible label for the palette. */
  'aria-label'?: string;
  /** Focus the search input on mount. Defaults to `true`. */
  autoFocus?: boolean;
}

const command = tokens.comp.command;
const c = cssVars.comp.command;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);

function matches(item: CommandItem, query: string): boolean {
  if (query === '') {
    return true;
  }
  const q = query.toLowerCase();
  return (
    item.label.toLowerCase().includes(q) ||
    (item.keywords ?? []).some((k) => k.toLowerCase().includes(q))
  );
}

/**
 * A hand-drawn command palette: a search input filtering a grouped
 * `role="listbox"`. DOM focus stays on the input (`role="combobox"`) while
 * `aria-activedescendant` drives a roving highlight over the visible commands.
 * ArrowUp/Down move the highlight, Enter runs the highlighted command. Colours
 * come from `@ghds/tokens` (`comp.command.*`). For a modal palette, use
 * {@link CommandDialog}.
 */
export function Command({
  groups,
  onSelect,
  placeholder = 'Type a command or search…',
  emptyMessage = 'No results found.',
  'aria-label': ariaLabel,
  autoFocus = true,
}: CommandProps) {
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // The flat list of visible (matching) commands, with their group headings.
  const visible = useMemo(() => {
    const out: { item: CommandItem; heading: string }[] = [];
    for (const group of groups) {
      for (const item of group.items) {
        if (matches(item, query)) {
          out.push({ item, heading: group.heading });
        }
      }
    }
    return out;
  }, [groups, query]);

  const enabledIndexes = useMemo(
    () =>
      visible
        .map((v, i) => ({ v, i }))
        .filter((x) => !x.v.item.disabled)
        .map((x) => x.i),
    [visible],
  );

  // Keep the highlight on a visible, enabled row as the query changes.
  useEffect(() => {
    setHighlight(enabledIndexes[0] ?? 0);
  }, [enabledIndexes]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const getOptionId = (value: string) => `${baseId}-option-${value}`;

  const move = (direction: 1 | -1) => {
    if (enabledIndexes.length === 0) {
      return;
    }
    const pos = enabledIndexes.indexOf(highlight);
    const startPos = pos === -1 ? 0 : pos;
    const nextPos = (startPos + direction + enabledIndexes.length) % enabledIndexes.length;
    const next = enabledIndexes[nextPos];
    if (next !== undefined) {
      setHighlight(next);
    }
  };

  const run = (item: CommandItem) => {
    if (item.disabled) {
      return;
    }
    onSelect?.(item.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Enter': {
        event.preventDefault();
        const entry = visible[highlight];
        if (entry) {
          run(entry.item);
        }
        break;
      }
    }
  };

  const highlightedValue = visible[highlight]?.item.value;

  const rootStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    width: '100%',
    background: c.bg,
    color: c.text.default,
    fontFamily: tokens.sys.typography.body.fontFamily,
  };

  const inputRowStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.sys.spacing.sm,
    padding: `${tokens.sys.spacing.sm} ${tokens.sys.spacing.md}`,
    borderBottom: `${STROKE_WIDTH}px solid ${c.input.stroke}`,
    color: c.text.muted,
  };

  const inputStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: c.text.default,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
  };

  // Track a running index so option ids line up with the flat `visible` list.
  let flatIndex = -1;

  return (
    <div style={rootStyle}>
      <div style={inputRowStyle}>
        <Icon name="search" size="sm" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label={ariaLabel ?? 'Command'}
          aria-expanded="true"
          aria-controls={listboxId}
          aria-activedescendant={
            highlightedValue !== undefined ? getOptionId(highlightedValue) : undefined
          }
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          style={inputStyle}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div
        id={listboxId}
        role="listbox"
        aria-label={ariaLabel ?? 'Commands'}
        style={{
          maxHeight: '20rem',
          overflowY: 'auto',
          padding: command.padding,
        }}
      >
        {visible.length === 0 ? (
          <div style={{ padding: tokens.sys.spacing.md, color: c.text.muted, textAlign: 'center' }}>
            {emptyMessage}
          </div>
        ) : (
          groups.map((group) => {
            const groupVisible = group.items.filter((item) => matches(item, query));
            if (groupVisible.length === 0) {
              return null;
            }
            return (
              // biome-ignore lint/a11y/useSemanticElements: this is a listbox option group; a <fieldset> would be invalid inside role="listbox"
              <div key={group.heading} role="group" aria-label={group.heading}>
                <div
                  style={{
                    padding: `${tokens.sys.spacing.xs} ${tokens.sys.spacing.sm}`,
                    color: c.text.muted,
                    fontSize: tokens.sys.typography.caption.fontSize,
                    fontWeight: tokens.sys.typography.label.fontWeight,
                  }}
                >
                  {group.heading}
                </div>
                {groupVisible.map((item) => {
                  flatIndex += 1;
                  const isHighlighted = flatIndex === highlight;
                  const optionStyle: CSSProperties = {
                    display: 'flex',
                    alignItems: 'center',
                    padding: `${tokens.sys.spacing.sm} ${tokens.sys.spacing.sm}`,
                    borderRadius: tokens.sys.radius.sm,
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    color: c.text.default,
                    opacity: item.disabled ? 0.5 : 1,
                    background: isHighlighted && !item.disabled ? c.item.selected : 'transparent',
                  };
                  const rowIndex = flatIndex;
                  return (
                    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling lives on the combobox input (aria-activedescendant); options are pointer targets
                    // biome-ignore lint/a11y/useFocusableInteractive: options are never focused — DOM focus stays on the input by design
                    <div
                      key={item.value}
                      id={getOptionId(item.value)}
                      role="option"
                      aria-selected={isHighlighted}
                      aria-disabled={item.disabled || undefined}
                      style={optionStyle}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => run(item)}
                      onMouseEnter={() => !item.disabled && setHighlight(rowIndex)}
                    >
                      {item.label}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export interface CommandDialogProps extends CommandProps {
  /** Whether the palette is shown. */
  open: boolean;
  /** Called when the dialog requests to close (Escape, scrim click). */
  onClose: () => void;
}

/**
 * A {@link Command} palette in a modal dialog. Reuses {@link Modal} for the
 * portal, scrim, focus trap, Escape-to-close and scroll lock. Selecting a
 * command does not auto-close — call `onClose` from your `onSelect` if desired.
 */
export function CommandDialog({ open, onClose, ...commandProps }: CommandDialogProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <Command {...commandProps} />
    </Modal>
  );
}
