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
  type ReactElement,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface, sketchHostStyle } from './SketchSurface.js';

export interface HoverCardProps {
  /** The element that reveals the card on hover / focus. */
  trigger: ReactElement;
  /** Card content. */
  children: ReactNode;
  /** Delay (ms) before opening on hover. Defaults to the `normal` duration. */
  openDelay?: number;
  /** Delay (ms) before closing after leaving. Defaults to the `normal` duration. */
  closeDelay?: number;
  /** Preferred placement. Defaults to `'bottom'`. */
  placement?: Placement;
}

const hoverCard = tokens.comp.hoverCard;
const c = cssVars.comp.hoverCard;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
const DEFAULT_DELAY = Number.parseFloat(tokens.sys.animation.duration.normal);

/**
 * A hand-drawn hover card: a non-modal floating panel that opens when the
 * trigger is hovered (after `openDelay`) or focused, and closes after
 * `closeDelay` once the pointer leaves both the trigger and the card. The
 * trigger is linked to the card via `aria-describedby`. Positioned with
 * `@floating-ui/react-dom`; colours and sketch parameters come from
 * `@ghds/tokens` (`comp.hoverCard.*`).
 */
export function HoverCard({
  trigger,
  children,
  openDelay = DEFAULT_DELAY,
  closeDelay = DEFAULT_DELAY,
  placement = 'bottom',
}: HoverCardProps) {
  const cardId = useId();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const { refs, floatingStyles } = useFloating({
    open,
    placement,
    strategy: 'fixed',
    whileElementsMounted: open ? autoUpdate : undefined,
    middleware: [
      offset(toPx(hoverCard.offset)),
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
    roughness: hoverCard.sketch.roughness,
    bowing: hoverCard.sketch.bowing,
    inset: INSET,
  });

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  const scheduleOpen = () => {
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(true), openDelay);
  };
  const scheduleClose = () => {
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(false), closeDelay);
  };

  if (!isValidElement(trigger)) {
    throw new Error('HoverCard expects a single React element as `trigger`');
  }

  // biome-ignore lint/suspicious/noExplicitAny: merging handlers onto an unknown child element's props
  const triggerProps = trigger.props as any;
  const triggerChildRef = (trigger as { ref?: Ref<unknown> }).ref ?? triggerProps.ref;
  const renderedTrigger = cloneElement(trigger, {
    ref: mergeRefs(refs.setReference, triggerChildRef),
    'aria-describedby': open ? cardId : triggerProps['aria-describedby'],
    onMouseEnter: (e: unknown) => {
      scheduleOpen();
      triggerProps.onMouseEnter?.(e);
    },
    onMouseLeave: (e: unknown) => {
      scheduleClose();
      triggerProps.onMouseLeave?.(e);
    },
    onFocus: (e: unknown) => {
      clearTimer();
      setOpen(true);
      triggerProps.onFocus?.(e);
    },
    onBlur: (e: unknown) => {
      scheduleClose();
      triggerProps.onBlur?.(e);
    },
    // biome-ignore lint/suspicious/noExplicitAny: cloneElement props for an unknown child type
  } as any);

  const cardStyle: CSSProperties = {
    ...floatingStyles,
    ...sketchHostStyle,
    display: open ? 'block' : 'none',
    zIndex: tokens.sys.zIndex.overlay,
    boxSizing: 'border-box',
    minWidth: '12rem',
    maxWidth: '20rem',
    padding: `${hoverCard.padding.vertical} ${hoverCard.padding.horizontal}`,
    color: c.text,
    fontFamily: tokens.sys.typography.body.fontFamily,
    fontSize: tokens.sys.typography.body.fontSize,
    lineHeight: String(tokens.sys.typography.body.lineHeight),
  };

  return (
    <>
      {renderedTrigger}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: pointer handlers only keep the non-modal card open while hovered; it holds no interactive role of its own */}
      <div
        ref={mergeRefs(refs.setFloating, sketchRef)}
        id={cardId}
        style={cardStyle}
        onMouseEnter={clearTimer}
        onMouseLeave={scheduleClose}
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
