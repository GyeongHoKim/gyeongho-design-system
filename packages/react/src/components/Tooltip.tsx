import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react-dom';
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

export interface TooltipProps {
  /** Tooltip text/content. */
  content: ReactNode;
  /** The single trigger element the tooltip describes. */
  children: ReactElement;
  /** Delay (ms) before showing on hover. Defaults to the `slow` motion duration. */
  delay?: number;
}

const tooltip = tokens.comp.tooltip;
const c = cssVars.comp.tooltip;
const STROKE_WIDTH = toPx(tokens.sys.border.width.default);
const INSET = STROKE_WIDTH;
/** Default hover-show delay, sourced from the motion scale. */
const DEFAULT_DELAY = Number.parseFloat(tokens.sys.animation.duration.slow);

/**
 * A hand-drawn tooltip. Wraps a single trigger element and shows a sketchy
 * bubble (`@ghds/sketch-core`) on hover (after `delay`) or focus, hiding on
 * leave / blur / Escape. The trigger is linked to the bubble via
 * `aria-describedby`; the bubble is `role="tooltip"`. Positioned with
 * `@floating-ui/react-dom` (`position: fixed`). Colours, padding, and sketch
 * parameters come from `@ghds/tokens` (`comp.tooltip.*`).
 */
export function Tooltip({ content, children, delay = DEFAULT_DELAY }: TooltipProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Whether the trigger currently holds keyboard focus — a mouse-leave must not
  // dismiss the tooltip while it does (WAI-ARIA tooltip: persist while focused).
  const focusedRef = useRef(false);

  // Cancel any pending hover timer when the component unmounts.
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
    placement: 'top',
    strategy: 'fixed',
    whileElementsMounted: open ? autoUpdate : undefined,
    middleware: [
      offset(toPx(tooltip.offset)),
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
    roughness: tooltip.sketch.roughness,
    bowing: tooltip.sketch.bowing,
    inset: INSET,
  });

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const show = () => {
    clearTimer();
    timerRef.current = setTimeout(() => setOpen(true), delay);
  };
  const showNow = () => {
    clearTimer();
    setOpen(true);
  };
  const hide = () => {
    clearTimer();
    setOpen(false);
  };

  if (!isValidElement(children)) {
    throw new Error('Tooltip expects a single React element child');
  }

  // biome-ignore lint/suspicious/noExplicitAny: merging handlers onto an unknown child element's props
  const childProps = children.props as any;
  // React 18 keeps the element's ref on `children.ref` (not in props); read both
  // so a consumer's ref on the trigger is preserved when we clone it.
  const childRef = (children as { ref?: Ref<unknown> }).ref ?? childProps.ref;
  const trigger = cloneElement(children, {
    ref: mergeRefs(refs.setReference, childRef),
    'aria-describedby': open ? tooltipId : childProps['aria-describedby'],
    onMouseEnter: (e: unknown) => {
      show();
      childProps.onMouseEnter?.(e);
    },
    onMouseLeave: (e: unknown) => {
      // Keep it open if the trigger is still focused.
      if (!focusedRef.current) {
        hide();
      }
      childProps.onMouseLeave?.(e);
    },
    onFocus: (e: unknown) => {
      focusedRef.current = true;
      showNow();
      childProps.onFocus?.(e);
    },
    onBlur: (e: unknown) => {
      focusedRef.current = false;
      hide();
      childProps.onBlur?.(e);
    },
    onKeyDown: (e: { key?: string } | undefined) => {
      if (e?.key === 'Escape') {
        hide();
      }
      childProps.onKeyDown?.(e);
    },
    // biome-ignore lint/suspicious/noExplicitAny: cloneElement props for an unknown child type
  } as any);

  const bubbleStyle: CSSProperties = {
    ...floatingStyles,
    ...sketchHostStyle,
    zIndex: tokens.sys.zIndex.tooltip,
    display: open ? 'block' : 'none',
    boxSizing: 'border-box',
    maxWidth: '16rem',
    padding: `${tooltip.padding.vertical} ${tooltip.padding.horizontal}`,
    color: c.text,
    fontFamily: tokens.sys.typography.caption.fontFamily,
    fontSize: tokens.sys.typography.caption.fontSize,
    lineHeight: String(tokens.sys.typography.caption.lineHeight),
    pointerEvents: 'none',
  };

  return (
    <>
      {trigger}
      <div
        ref={mergeRefs(refs.setFloating, sketchRef)}
        id={tooltipId}
        role="tooltip"
        style={bubbleStyle}
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
          />
        )}
        <span style={{ position: 'relative' }}>{content}</span>
      </div>
    </>
  );
}
