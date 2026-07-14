import {
  autoUpdate,
  flip,
  offset,
  type Placement,
  shift,
  useFloating,
} from '@floating-ui/react-dom';
import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
  cloneElement,
  isValidElement,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
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

export interface PopoverProps {
  /** The single element that toggles the popover on click. */
  trigger: ReactElement;
  /** Popover panel content. */
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Called with the next open state when it changes. */
  onOpenChange?: (open: boolean) => void;
  /** Preferred placement. Defaults to `'bottom'`. */
  placement?: Placement;
  /** Accessible label for the panel. */
  'aria-label'?: string;
}

const popover = tokens.comp.popover;
const c = cssVars.comp.popover;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * A hand-drawn popover: a click-triggered floating panel positioned with
 * `@floating-ui/react-dom`. The trigger gets `aria-haspopup="dialog"` +
 * `aria-expanded`; opening moves focus into the panel, Escape / outside-click
 * close it and restore focus to the trigger. Non-modal (the rest of the page
 * stays interactive). Colours, padding and sketch parameters come from
 * `@ghds/tokens` (`comp.popover.*`).
 */
export function Popover({
  trigger,
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  'aria-label': ariaLabel,
}: PopoverProps) {
  const panelId = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const { refs, floatingStyles } = useFloating({
    open,
    placement,
    strategy: 'fixed',
    whileElementsMounted: open ? autoUpdate : undefined,
    middleware: [
      offset(toPx(popover.offset)),
      flip(),
      shift({ padding: toPx(tokens.sys.spacing.sm) }),
    ],
  });

  const {
    ref: sketchRef,
    drawable,
    size,
  } = useSketch<HTMLDivElement>({
    fillStyle: 'solid',
    roughness: popover.sketch.roughness,
    bowing: popover.sketch.bowing,
    inset: INSET,
  });

  const outsideRefs = useMemo(() => [triggerRef, panelRef], []);
  useClickOutside(
    outsideRefs,
    open,
    useCallback(() => setOpen(false), [setOpen]),
  );

  // Move focus into the panel on open; restore to the trigger on close.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) {
      const panel = panelRef.current;
      const focusable = panel?.querySelector<HTMLElement>(FOCUSABLE);
      (focusable ?? panel)?.focus();
    } else if (!open && wasOpen.current) {
      triggerRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  if (!isValidElement(trigger)) {
    throw new Error('Popover expects a single React element as `trigger`');
  }

  // biome-ignore lint/suspicious/noExplicitAny: merging handlers onto an unknown child element's props
  const triggerProps = trigger.props as any;
  const triggerChildRef = (trigger as { ref?: Ref<unknown> }).ref ?? triggerProps.ref;
  const renderedTrigger = cloneElement(trigger, {
    ref: mergeRefs(refs.setReference, triggerRef, triggerChildRef),
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': open ? panelId : undefined,
    onClick: (e: unknown) => {
      setOpen(!open);
      triggerProps.onClick?.(e);
    },
    // biome-ignore lint/suspicious/noExplicitAny: cloneElement props for an unknown child type
  } as any);

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      setOpen(false);
    }
  };

  const panelStyle: CSSProperties = {
    ...floatingStyles,
    ...sketchHostStyle,
    display: open ? 'block' : 'none',
    zIndex: tokens.sys.zIndex.overlay,
    boxSizing: 'border-box',
    minWidth: '12rem',
    maxWidth: '20rem',
    padding: `${popover.padding.vertical} ${popover.padding.horizontal}`,
    color: c.text,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
  };

  return (
    <>
      {renderedTrigger}
      <div
        ref={mergeRefs(refs.setFloating, panelRef, sketchRef)}
        id={panelId}
        role="dialog"
        aria-label={ariaLabel}
        tabIndex={-1}
        style={panelStyle}
        onKeyDown={handlePanelKeyDown}
      >
        {open && (
          <SketchSurface
            drawable={drawable}
            width={size.width}
            height={size.height}
            strokeColor={c.stroke}
            strokeWidth={STROKE_WIDTH}
            fillColor={c.bg}
            fillRendering="fill"
            shadowColor={c.stroke}
          />
        )}
        <div style={{ position: 'relative' }}>{children}</div>
      </div>
    </>
  );
}
