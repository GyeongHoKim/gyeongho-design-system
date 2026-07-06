import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useRef,
  useState,
} from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** One tab and its panel content. */
export interface TabItem {
  /** Stable identifier and controlled value. */
  value: string;
  /** Visible tab label. */
  label: string;
  /** Panel content shown when this tab is active. */
  content: ReactNode;
  /** Disables the tab (skipped by keyboard navigation). */
  disabled?: boolean;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  /** The tabs and their panels. */
  items: TabItem[];
  /** Controlled active value. */
  value?: string;
  /** Initial active value when uncontrolled. Defaults to the first tab. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name for the tablist. */
  label?: string;
}

const tabs = tokens.comp.tabs;
const c = cssVars.comp.tabs;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

interface TabButtonProps {
  item: TabItem;
  selected: boolean;
  tabId: string;
  panelId: string;
  onSelect: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

function TabButton({
  item,
  selected,
  tabId,
  panelId,
  onSelect,
  onKeyDown,
  buttonRef,
}: TabButtonProps) {
  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLButtonElement>({
    fillStyle: 'solid',
    roughness: tabs.sketch.roughness,
    bowing: tabs.sketch.bowing,
    inset: INSET,
  });
  const ref = mergeRefs(sketchRef, buttonRef);

  const textColor = item.disabled
    ? c.tab.text.disabled
    : selected
      ? c.tab.text.selected
      : c.tab.text.default;

  const style: CSSProperties = {
    ...sketchHostStyle,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: `${tokens.sys.spacing.xs} ${tokens.sys.spacing.md}`,
    border: 'none',
    background: 'transparent',
    color: textColor,
    cursor: item.disabled ? 'not-allowed' : 'pointer',
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    fontWeight: selected
      ? tokens.sys.typography.label.fontWeight
      : tokens.sys.typography.body.fontWeight,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
  };

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={tabId}
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      disabled={item.disabled}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      style={style}
    >
      {selected && (
        <SketchSurface
          drawable={drawable}
          width={size.width}
          height={size.height}
          strokeColor={c.tab.stroke.selected}
          strokeWidth={STROKE_WIDTH}
          fillColor={c.tab.bg.selected}
          fillRendering="fill"
        />
      )}
      <span style={{ position: 'relative' }}>{item.label}</span>
    </button>
  );
}

/**
 * A hand-drawn tabbed interface following the WAI-ARIA Tabs pattern: a
 * `role="tablist"` of `role="tab"` buttons driving `role="tabpanel"` regions.
 * Keyboard: Arrow keys / Home / End move between (and activate) tabs via roving
 * tabindex — DOM focus lives on the active tab only. The active tab is filled
 * with a sketchy box (`@ghds/sketch-core`); all colours and sketch parameters
 * come from `@ghds/tokens` (`comp.tabs.*`).
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { items, value, defaultValue, onValueChange, label, style, ...rest },
  ref,
) {
  const reactId = useId();
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const requested = value !== undefined ? value : internalValue;
  // Resolve to the requested tab only when it exists and is enabled; otherwise
  // fall back to the first enabled tab. This keeps the tablist keyboard-reachable
  // when the first tab is disabled and recovers if `items` changes out from under
  // a stale selection.
  const current =
    requested !== undefined && items.some((item) => item.value === requested && !item.disabled)
      ? requested
      : (items.find((item) => !item.disabled)?.value ?? items[0]?.value);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (next: string) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabled = items.map((item, i) => ({ item, i })).filter((x) => !x.item.disabled);
    const pos = enabled.findIndex((x) => x.i === index);
    if (pos === -1 || enabled.length === 0) {
      return;
    }
    let nextPos = pos;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextPos = (pos + 1) % enabled.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextPos = (pos - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        nextPos = 0;
        break;
      case 'End':
        nextPos = enabled.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const nextItem = enabled[nextPos];
    if (nextItem) {
      select(nextItem.item.value);
      buttonsRef.current[nextItem.i]?.focus();
    }
  };

  const tablistStyle: CSSProperties = {
    display: 'flex',
    gap: tabs.gap,
    flexWrap: 'wrap',
  };

  const panelStyle: CSSProperties = {
    marginTop: tokens.sys.spacing.md,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
    color: tokens.sys.color.text.primary,
  };

  return (
    <div ref={ref} style={style} {...rest}>
      <div role="tablist" aria-label={label} style={tablistStyle}>
        {items.map((item, index) => {
          const selected = item.value === current;
          return (
            <TabButton
              key={item.value}
              item={item}
              selected={selected}
              tabId={`${reactId}-tab-${item.value}`}
              panelId={`${reactId}-panel-${item.value}`}
              onSelect={() => {
                if (!item.disabled) {
                  select(item.value);
                }
              }}
              onKeyDown={(event) => handleKeyDown(event, index)}
              buttonRef={(el) => {
                buttonsRef.current[index] = el;
              }}
            />
          );
        })}
      </div>
      {items.map((item) => {
        const selected = item.value === current;
        return (
          <div
            key={item.value}
            role="tabpanel"
            id={`${reactId}-panel-${item.value}`}
            aria-labelledby={`${reactId}-tab-${item.value}`}
            hidden={!selected}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: WAI-ARIA Tabs pattern makes the panel focusable (tabindex=0) so keyboard users can reach panel content
            tabIndex={0}
            style={selected ? panelStyle : undefined}
          >
            {selected && item.content}
          </div>
        );
      })}
    </div>
  );
});
