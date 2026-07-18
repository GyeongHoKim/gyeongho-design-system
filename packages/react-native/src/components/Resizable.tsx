import { line, type SketchDrawable } from '@ghds/sketch-core';
import { useTheme } from '@shopify/restyle';
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PanResponder, type StyleProp, type ViewStyle } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Layout axis a {@link ResizablePanelGroup} splits along. */
export type ResizableDirection = 'horizontal' | 'vertical';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/* ------------------------------------------------------------------ Panel */

/** Props for {@link ResizablePanel}. */
export interface ResizablePanelProps {
  /** Initial size as a percentage of the group. Defaults to an equal split. */
  defaultSize?: number;
  /** Smallest size (percent) the panel may shrink to. Defaults to `10`. */
  minSize?: number;
  /** Largest size (percent) the panel may grow to. Defaults to `90`. */
  maxSize?: number;
  /** Panel content. */
  children?: ReactNode;
}

/** Internal props injected by {@link ResizablePanelGroup} via `cloneElement`. */
interface ResizablePanelInternal {
  __size?: number;
}

/** A single resizable region. Sized by its parent {@link ResizablePanelGroup}. */
export function ResizablePanel({
  defaultSize,
  minSize,
  maxSize,
  __size,
  children,
}: ResizablePanelProps & ResizablePanelInternal) {
  // minSize/maxSize are read by the group (via panelBounds), not here.
  void minSize;
  void maxSize;
  return (
    <Box
      style={{
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: `${__size ?? defaultSize ?? 0}%`,
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

/* ----------------------------------------------------------------- Handle */

/** Props for {@link ResizableHandle}. */
export interface ResizableHandleProps {
  /** Shows a visible grip in the middle of the handle. */
  withHandle?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

/** Internal props injected by {@link ResizablePanelGroup}. */
interface ResizableHandleInternal {
  __direction?: ResizableDirection;
  __valueNow?: number;
  __onDragStart?: () => void;
  __onDrag?: (delta: number) => void;
}

/** The draggable divider between two {@link ResizablePanel}s. */
export function ResizableHandle({
  withHandle = false,
  testID,
  __direction = 'horizontal',
  __valueNow,
  __onDragStart,
  __onDrag,
}: ResizableHandleProps & ResizableHandleInternal) {
  const theme = useTheme<Theme>();
  const horizontal = __direction === 'horizontal';

  const { onLayout, size, seed } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.resizableSketch.roughness,
    bowing: theme.resizableSketch.bowing,
  });

  const drawable = useMemo<SketchDrawable | null>(() => {
    const { width, height } = size;
    if (width <= 0 || height <= 0) {
      return null;
    }
    const options = {
      roughness: theme.resizableSketch.roughness,
      bowing: theme.resizableSketch.bowing,
      seed,
    };
    return horizontal
      ? line(width / 2, 0, width / 2, height, options)
      : line(0, height / 2, width, height / 2, options);
  }, [size, horizontal, seed, theme.resizableSketch.roughness, theme.resizableSketch.bowing]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => __onDragStart?.(),
        onPanResponderMove: (_event, gesture) => __onDrag?.(horizontal ? gesture.dx : gesture.dy),
      }),
    [__onDragStart, __onDrag, horizontal],
  );

  return (
    <Box
      onLayout={onLayout}
      alignItems="center"
      justifyContent="center"
      testID={testID}
      accessibilityRole="adjustable"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(__valueNow ?? 0) }}
      // react-native-web does not map the nested `accessibilityValue` object to
      // the flat `aria-value*` DOM props (same gap the Slider documents), so set
      // them directly for the web target.
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(__valueNow ?? 0)}
      style={[
        { alignSelf: 'stretch' },
        horizontal ? { width: theme.resizableSize } : { height: theme.resizableSize },
      ]}
      {...panResponder.panHandlers}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={theme.colors.resizableHandleDefault}
        strokeWidth={theme.resizableSize}
      />
      {withHandle ? (
        <Box
          style={{
            width: horizontal ? theme.spacing.xs : theme.spacing.lg,
            height: horizontal ? theme.spacing.lg : theme.spacing.xs,
            borderRadius: theme.borderRadii.resizable,
            backgroundColor: theme.colors.resizableGripDefault,
          }}
        />
      ) : null}
    </Box>
  );
}

/* ------------------------------------------------------------------ Group */

/** Props for {@link ResizablePanelGroup}. */
export interface ResizablePanelGroupProps {
  /** Axis the panels are laid out and resized along. */
  direction: ResizableDirection;
  /** Panels and handles, in order. */
  children?: ReactNode;
  /** Extra style merged onto the group container. */
  style?: StyleProp<ViewStyle>;
  /** Test handle for queries. */
  testID?: string;
}

function panelBounds(panel: ReactElement<ResizablePanelProps>): { min: number; max: number } {
  return { min: panel.props.minSize ?? 10, max: panel.props.maxSize ?? 90 };
}

/**
 * A hand-drawn resizable split view built on `PanResponder` — no third-party
 * engine. Lay out {@link ResizablePanel}s separated by {@link ResizableHandle}s;
 * dragging a handle redistributes space between its two neighbours. Sizes are
 * percentages of the group, measured via `onLayout`. (Touch-drag only — there
 * is no arrow-key adjustment, unlike the keyboard-operable web build.)
 */
export function ResizablePanelGroup({
  direction,
  children,
  style,
  testID,
}: ResizablePanelGroupProps) {
  const horizontal = direction === 'horizontal';
  const [extent, setExtent] = useState(0);
  const startSizesRef = useRef<number[]>([]);

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
        __onDragStart: () => {
          startSizesRef.current = [...sizes];
        },
        __onDrag: (delta: number) => {
          const deltaPct = extent > 0 ? (delta / extent) * 100 : 0;
          resizePair(before, startSizesRef.current, deltaPct);
        },
      });
    }
    return item;
  });

  return (
    <Box
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setExtent(horizontal ? width : height);
      }}
      testID={testID}
      style={[{ flexDirection: horizontal ? 'row' : 'column', flex: 1 }, style]}
    >
      {rendered}
    </Box>
  );
}
