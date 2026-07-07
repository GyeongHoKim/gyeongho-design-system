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
import { toPx } from '../lib/units.js';
import { Icon } from './Icon.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

/** One collapsible section. */
export interface AccordionItem {
  /** Stable identifier / open-state value. */
  value: string;
  /** Header label. */
  label: string;
  /** Revealed content. */
  content: ReactNode;
  /** Disables the section. */
  disabled?: boolean;
}

export interface AccordionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children' | 'defaultValue'> {
  /** The collapsible sections. */
  items: AccordionItem[];
  /** `'single'` keeps at most one open; `'multiple'` allows many. Defaults to `'single'`. */
  type?: 'single' | 'multiple';
  /** Controlled set of open values. */
  value?: string[];
  /** Initial open values when uncontrolled. */
  defaultValue?: string[];
  onValueChange?: (values: string[]) => void;
}

const accordion = tokens.comp.accordion;
const c = cssVars.comp.accordion;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;

interface AccordionItemViewProps {
  item: AccordionItem;
  open: boolean;
  headerId: string;
  regionId: string;
  onToggle: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  headerRef: (el: HTMLButtonElement | null) => void;
}

function AccordionItemView({
  item,
  open,
  headerId,
  regionId,
  onToggle,
  onKeyDown,
  headerRef,
}: AccordionItemViewProps) {
  const { ref, drawable, size } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: accordion.sketch.roughness,
    bowing: accordion.sketch.bowing,
    inset: INSET,
  });

  const rootStyle: CSSProperties = {
    ...sketchHostStyle,
    boxSizing: 'border-box',
  };

  const headerStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.sys.spacing.sm,
    width: '100%',
    boxSizing: 'border-box',
    padding: accordion.padding,
    border: 'none',
    background: 'transparent',
    color: item.disabled ? tokens.sys.color.text.disabled : c.text.header,
    cursor: item.disabled ? 'not-allowed' : 'pointer',
    fontFamily: tokens.sys.typography.label.fontFamily,
    fontSize: tokens.sys.typography.label.fontSize,
    fontWeight: tokens.sys.typography.label.fontWeight,
    lineHeight: String(tokens.sys.typography.label.lineHeight),
    textAlign: 'left',
  };

  const contentStyle: CSSProperties = {
    position: 'relative',
    padding: `0 ${accordion.padding} ${accordion.padding}`,
    color: c.text.content,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
  };

  return (
    <div ref={ref} style={rootStyle}>
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.stroke}
        strokeWidth={STROKE_WIDTH}
        fillColor={c.bg}
        fillRendering="fill"
      />
      <button
        ref={headerRef}
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={regionId}
        disabled={item.disabled}
        onClick={onToggle}
        onKeyDown={onKeyDown}
        style={headerStyle}
      >
        <span>{item.label}</span>
        <Icon
          name="chevron-down"
          size="sm"
          style={{
            color: c.text.icon,
            transform: open ? 'rotate(180deg)' : undefined,
            transition: `transform ${tokens.sys.animation.duration.fast} ${tokens.sys.animation.easing.standard}`,
          }}
        />
      </button>
      <section id={regionId} aria-labelledby={headerId} hidden={!open} style={contentStyle}>
        {open && item.content}
      </section>
    </div>
  );
}

/**
 * A hand-drawn accordion (disclosure pattern). Each section is a sketchy box
 * (`@ghds/sketch-core`) with a header button (`aria-expanded` /
 * `aria-controls`) and a collapsible `role="region"`. `type="single"` keeps at
 * most one section open; `"multiple"` allows many. All colours, padding, and
 * sketch parameters come from `@ghds/tokens` (`comp.accordion.*`).
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { items, type = 'single', value, defaultValue, onValueChange, style, ...rest },
  ref,
) {
  const reactId = useId();
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const open = value ?? internalValue;
  const headersRef = useRef<(HTMLButtonElement | null)[]>([]);

  const setOpen = (next: string[]) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const toggle = (itemValue: string) => {
    const isOpen = open.includes(itemValue);
    if (type === 'single') {
      setOpen(isOpen ? [] : [itemValue]);
    } else {
      setOpen(isOpen ? open.filter((v) => v !== itemValue) : [...open, itemValue]);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabled = items.map((item, i) => ({ item, i })).filter((x) => !x.item.disabled);
    const pos = enabled.findIndex((x) => x.i === index);
    if (pos === -1 || enabled.length === 0) {
      return;
    }
    let nextPos = pos;
    switch (event.key) {
      case 'ArrowDown':
        nextPos = (pos + 1) % enabled.length;
        break;
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
    const next = enabled[nextPos];
    if (next) {
      headersRef.current[next.i]?.focus();
    }
  };

  const listStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: accordion.gap,
    ...style,
  };

  return (
    <div ref={ref} style={listStyle} {...rest}>
      {items.map((item, index) => (
        <AccordionItemView
          key={item.value}
          item={item}
          open={open.includes(item.value)}
          headerId={`${reactId}-header-${item.value}`}
          regionId={`${reactId}-region-${item.value}`}
          onToggle={() => {
            if (!item.disabled) {
              toggle(item.value);
            }
          }}
          onKeyDown={(event) => handleKeyDown(event, index)}
          headerRef={(el) => {
            headersRef.current[index] = el;
          }}
        />
      ))}
    </div>
  );
});
