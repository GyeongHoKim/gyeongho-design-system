import { line, type SketchDrawable } from '@ghds/sketch-core';
import { tokens } from '@ghds/tokens';
import {
  Children,
  type CSSProperties,
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type KeyboardEvent,
  type ReactElement,
  type PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSketch } from '../hooks/useSketch.js';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';
import { toPx } from '../lib/units.js';
import { SketchSurface } from './SketchSurface.js';

/** Layout axis a {@link ResizablePanelGroup} splits along. */
export type ResizableDirection = 'horizontal' | 'vertical';

const c = cssVars.comp.resizable;
const STROKE_WIDTH = toPx(tokens.comp.resizable.size);
const KEYBOARD_STEP = 5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/* ------------------------------------------------------------------ Panel */

export interface ResizablePanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Initial size as a percentage of the group. Defaults to an equal split. */
  defaultSize?: number;
  /** Smallest size (percent) the panel may shrink to. Defaults to `10`. */
  minSize?: number;
  /** Largest size (percent) the panel may grow to. Defaults to `90`. */
  maxSize?: number;
}

/** Internal props injected by {@link ResizablePanelGroup} via `cloneElement`. */
interface ResizablePanelInternal {
  __size?: number;
}

/** A single resizable region. Sized by its parent {@link ResizablePanelGroup}. */
export const ResizablePanel = forwardRef<
  HTMLDivElement,
  ResizablePanelProps & ResizablePanelInternal
>(function ResizablePanel(
  { defaultSize, minSize, maxSize, __size, children, style, ...rest },
  forwardedRef,
) {
  void defaultSize;
  void minSize;
  void maxSize;
  const panelStyle: CSSProperties = {
    flex: `0 0 ${__size ?? defaultSize ?? 0}%`,
    overflow: 'auto',
    minWidth: 0,
    minHeight: 0,
    ...style,
  };
  return (
    <div ref={forwardedRef} style={panelStyle} {...rest}>
      {children}
    </div>
  );
});

/* ----------------------------------------------------------------- Handle */

export interface ResizableHandleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrag'> {
  /** Shows a visible grip in the middle of the handle. */
  withHandle?: boolean;
}

/** Internal props injected by {@link ResizablePanelGroup}. */
interface ResizableHandleInternal {
  __direction?: ResizableDirection;
  __valueNow?: number;
  __onResizeStart?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  __onResizeKey?: (deltaPct: number) => void;
}

/** The draggable divider between two {@link ResizablePanel}s. */
export const ResizableHandle = forwardRef<
  HTMLDivElement,
  ResizableHandleProps & ResizableHandleInternal
>(function ResizableHandle(
  {
    withHandle = false,
    __direction = 'horizontal',
    __valueNow,
    __onResizeStart,
    __onResizeKey,
    style,
    ...rest
  },
  forwardedRef,
) {
  const horizontal = __direction === 'horizontal';
  const {
    ref: sketchRef,
    size,
    seed,
  } = useSketch<HTMLDivElement>({
    roughness: tokens.comp.resizable.sketch.roughness,
    bowing: tokens.comp.resizable.sketch.bowing,
  });

  const drawable = useMemo<SketchDrawable | null>(() => {
    const { width, height } = size;
    if (width <= 0 || height <= 0) {
      return null;
    }
    const options = {
      roughness: tokens.comp.resizable.sketch.roughness,
      bowing: tokens.comp.resizable.sketch.bowing,
      seed,
    };
    return horizontal
      ? line(width / 2, 0, width / 2, height, options)
      : line(0, height / 2, width, height / 2, options);
  }, [size, horizontal, seed]);

  const ref = mergeRefs(sketchRef, forwardedRef);

  const handleStyle: CSSProperties = {
    position: 'relative',
    flex: `0 0 ${tokens.comp.resizable.size}`,
    alignSelf: 'stretch',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    cursor: horizontal ? 'col-resize' : 'row-resize',
    touchAction: 'none',
    ...style,
  };

  const gripStyle: CSSProperties = {
    position: 'relative',
    width: horizontal ? tokens.sys.spacing.xs : tokens.sys.spacing.lg,
    height: horizontal ? tokens.sys.spacing.lg : tokens.sys.spacing.xs,
    borderRadius: tokens.comp.resizable.radius,
    background: c.grip.default,
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const decreaseKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
    const increaseKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    if (event.key === decreaseKey) {
      event.preventDefault();
      __onResizeKey?.(-KEYBOARD_STEP);
    } else if (event.key === increaseKey) {
      event.preventDefault();
      __onResizeKey?.(KEYBOARD_STEP);
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: a focusable, draggable resize handle needs role="separator" with aria-valuenow/min/max; an <hr> cannot be a keyboard-operable widget or hold a grip child.
    <div
      ref={ref}
      role="separator"
      aria-orientation={horizontal ? 'vertical' : 'horizontal'}
      aria-valuenow={__valueNow !== undefined ? Math.round(__valueNow) : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      style={handleStyle}
      onPointerDown={__onResizeStart}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <SketchSurface
        drawable={drawable}
        width={size.width}
        height={size.height}
        strokeColor={c.handle.default}
        strokeWidth={STROKE_WIDTH}
      />
      {withHandle && <span style={gripStyle} />}
    </div>
  );
});

/* ------------------------------------------------------------------ Group */

export interface ResizablePanelGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Axis the panels are laid out and resized along. */
  direction: ResizableDirection;
}

function panelBounds(panel: ReactElement<ResizablePanelProps>): { min: number; max: number } {
  return { min: panel.props.minSize ?? 10, max: panel.props.maxSize ?? 90 };
}

/**
 * A hand-drawn resizable split view built on pointer events — no third-party
 * engine. Lay out {@link ResizablePanel}s separated by {@link ResizableHandle}s;
 * dragging a handle (or focusing it and pressing the arrow keys) redistributes
 * space between its two neighbours. Sizes are percentages of the group.
 */
export const ResizablePanelGroup = forwardRef<HTMLDivElement, ResizablePanelGroupProps>(
  function ResizablePanelGroup({ direction, children, style, ...rest }, forwardedRef) {
    const groupRef = useRef<HTMLDivElement | null>(null);
    const horizontal = direction === 'horizontal';

    const items = Children.toArray(children).filter(isValidElement) as ReactElement[];
    const panels = items.filter(
      (item) => item.type === ResizablePanel,
    ) as ReactElement<ResizablePanelProps>[];

    const [sizes, setSizes] = useState<number[]>(() => {
      const count = panels.length;
      if (count === 0) {
        return [];
      }
      const even = 100 / count;
      const raw = panels.map((panel) => panel.props.defaultSize ?? even);
      const total = raw.reduce((sum, value) => sum + value, 0);
      return total > 0 ? raw.map((value) => (value / total) * 100) : raw;
    });

    const resizePair = (before: number, startSizes: number[], deltaPct: number) => {
      const a = before;
      const b = before + 1;
      const sizeA = startSizes[a];
      const sizeB = startSizes[b];
      const panelA = panels[a];
      const panelB = panels[b];
      if (a < 0 || b >= startSizes.length || sizeA === undefined || sizeB === undefined) {
        return;
      }
      if (!panelA || !panelB) {
        return;
      }
      const pairTotal = sizeA + sizeB;
      const boundsA = panelBounds(panelA);
      const boundsB = panelBounds(panelB);
      let nextA = clamp(sizeA + deltaPct, boundsA.min, boundsA.max);
      // Keep the pair's combined size constant, then re-clamp against B.
      const nextB = clamp(pairTotal - nextA, boundsB.min, boundsB.max);
      nextA = pairTotal - nextB;
      const next = [...startSizes];
      next[a] = nextA;
      next[b] = nextB;
      setSizes(next);
    };

    const startDrag = (before: number, event: ReactPointerEvent<HTMLDivElement>) => {
      const group = groupRef.current;
      if (!group) {
        return;
      }
      event.preventDefault();
      const extent = horizontal ? group.clientWidth : group.clientHeight;
      const startPos = horizontal ? event.clientX : event.clientY;
      const startSizes = [...sizes];
      const onMove = (moveEvent: PointerEvent) => {
        const pos = horizontal ? moveEvent.clientX : moveEvent.clientY;
        const deltaPct = extent > 0 ? ((pos - startPos) / extent) * 100 : 0;
        resizePair(before, startSizes, deltaPct);
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        document.body.style.userSelect = '';
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      document.body.style.userSelect = 'none';
    };

    const groupStyle: CSSProperties = {
      display: 'flex',
      flexDirection: horizontal ? 'row' : 'column',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      ...style,
    };

    let panelCursor = 0;
    const rendered = items.map((item, index) => {
      if (item.type === ResizablePanel) {
        const panelIndex = panelCursor;
        panelCursor += 1;
        return cloneElement(item as ReactElement<ResizablePanelInternal>, {
          // biome-ignore lint/suspicious/noArrayIndexKey: children are a fixed positional list of panels/handles
          key: `panel-${index}`,
          __size: sizes[panelIndex],
        });
      }
      if (item.type === ResizableHandle) {
        const before = panelCursor - 1;
        return cloneElement(item as ReactElement<ResizableHandleInternal>, {
          // biome-ignore lint/suspicious/noArrayIndexKey: children are a fixed positional list of panels/handles
          key: `handle-${index}`,
          __direction: direction,
          __valueNow: sizes[before],
          __onResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => startDrag(before, event),
          __onResizeKey: (deltaPct: number) => resizePair(before, sizes, deltaPct),
        });
      }
      return item;
    });

    return (
      <div ref={mergeRefs(groupRef, forwardedRef)} style={groupStyle} {...rest}>
        {rendered}
      </div>
    );
  },
);
