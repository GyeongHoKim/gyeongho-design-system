import type { IconName } from '@ghds/icons';
import { useTheme } from '@shopify/restyle';
import { createContext, type ReactNode, useContext, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
} from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** Scroll axis of a {@link Carousel}. */
export type CarouselOrientation = 'horizontal' | 'vertical';

interface CarouselContextValue {
  readonly orientation: CarouselOrientation;
  /** Measured viewport length along the scroll axis (width or height). */
  readonly viewportSize: number;
  /** Ref callback for the scroll track element. */
  readonly attachScroll: (node: ScrollView | null) => void;
  readonly onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  readonly onViewportLayout: (event: LayoutChangeEvent) => void;
  readonly onContentSizeChange: (width: number, height: number) => void;
  readonly scrollPrev: () => void;
  readonly scrollNext: () => void;
  readonly canScrollPrev: boolean;
  readonly canScrollNext: boolean;
  /** Total number of viewport-sized pages (derived from content size). */
  readonly count: number;
  /** Index of the page currently snapped into view. */
  readonly activeIndex: number;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarousel(): CarouselContextValue {
  const ctx = useContext(CarouselContext);
  if (!ctx) {
    throw new Error('Carousel subcomponents must be rendered inside a <Carousel>');
  }
  return ctx;
}

/** Props for {@link Carousel}. */
export interface CarouselProps {
  /** Scroll axis. Defaults to `'horizontal'`. */
  orientation?: CarouselOrientation;
  /** Carousel content — compose with the `Carousel*` sub-components. */
  children?: ReactNode;
  /** Accessible label for the carousel region. */
  accessibilityLabel?: string;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn carousel built on a native `ScrollView` with paging — no
 * third-party engine. Compose it with {@link CarouselContent},
 * {@link CarouselItem}, {@link CarouselPrevious}/{@link CarouselNext} and the
 * optional {@link CarouselIndicators}. The root exposes a labelled region and
 * moves one viewport per step; the controls disable at the ends. Gap, indicator
 * colours and size all come from `@ghds/tokens` (`comp.carousel.*`) via the
 * Restyle theme.
 */
export function Carousel({
  orientation = 'horizontal',
  children,
  accessibilityLabel,
  testID,
}: CarouselProps) {
  const horizontal = orientation === 'horizontal';
  const scrollRef = useRef<ScrollView | null>(null);
  const [offset, setOffset] = useState(0);
  const [viewportSize, setViewportSize] = useState(0);
  const [contentSize, setContentSize] = useState(0);

  const maxOffset = Math.max(0, contentSize - viewportSize);
  const canScrollPrev = offset > 1;
  const canScrollNext = offset < maxOffset - 1;
  const count = viewportSize > 0 ? Math.round(contentSize / viewportSize) : 0;
  const activeIndex = viewportSize > 0 ? Math.round(offset / viewportSize) : 0;

  const scrollByStep = (direction: 1 | -1) => {
    if (viewportSize <= 0) {
      return;
    }
    const target = Math.max(0, Math.min(offset + direction * viewportSize, maxOffset));
    scrollRef.current?.scrollTo(
      horizontal ? { x: target, animated: true } : { y: target, animated: true },
    );
  };

  const contextValue: CarouselContextValue = {
    orientation,
    viewportSize,
    attachScroll: (node) => {
      scrollRef.current = node;
    },
    onScroll: (event) => {
      const { x, y } = event.nativeEvent.contentOffset;
      setOffset(horizontal ? x : y);
    },
    onViewportLayout: (event) => {
      const { width, height } = event.nativeEvent.layout;
      setViewportSize(horizontal ? width : height);
    },
    onContentSizeChange: (width, height) => {
      setContentSize(horizontal ? width : height);
    },
    scrollPrev: () => scrollByStep(-1),
    scrollNext: () => scrollByStep(1),
    canScrollPrev,
    canScrollNext,
    count,
    activeIndex,
  };

  return (
    <CarouselContext.Provider value={contextValue}>
      <Box
        position="relative"
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        {children}
      </Box>
    </CarouselContext.Provider>
  );
}

/** Props shared by the layout sub-components. */
interface SlotProps {
  children?: ReactNode;
}

/** The paging scroll track that holds the {@link CarouselItem}s. */
export function CarouselContent({ children }: SlotProps) {
  const theme = useTheme<Theme>();
  const { orientation, attachScroll, onScroll, onViewportLayout, onContentSizeChange } =
    useCarousel();
  const horizontal = orientation === 'horizontal';

  return (
    <ScrollView
      ref={attachScroll}
      horizontal={horizontal}
      pagingEnabled
      scrollEventThrottle={16}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      onLayout={onViewportLayout}
      onContentSizeChange={onContentSizeChange}
      contentContainerStyle={{
        flexDirection: horizontal ? 'row' : 'column',
        gap: theme.spacing.carouselGap,
      }}
    >
      {children}
    </ScrollView>
  );
}

/** A single slide. Defaults to filling one viewport along the scroll axis. */
export function CarouselItem({ children }: SlotProps) {
  const { orientation, viewportSize } = useCarousel();
  const horizontal = orientation === 'horizontal';
  const length = viewportSize > 0 ? viewportSize : undefined;

  return (
    <Box
      width={horizontal ? length : undefined}
      height={horizontal ? undefined : length}
      accessibilityRole="none"
      accessibilityLabel="slide"
    >
      {children}
    </Box>
  );
}

interface CarouselControlProps {
  disabled: boolean;
  onPress: () => void;
  iconName: IconName;
  label: string;
  testID?: string;
}

function CarouselControl({ disabled, onPress, iconName, label, testID }: CarouselControlProps) {
  const theme = useTheme<Theme>();
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.sketch.roughness,
    bowing: theme.sketch.bowing,
  });

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onLayout={onLayout}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      testID={testID}
      style={{ padding: theme.spacing.sm, alignItems: 'center', justifyContent: 'center' }}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={disabled ? theme.colors.borderSubtle : theme.colors.borderDefault}
        strokeWidth={theme.borderWidths.default}
      />
      <Icon
        name={iconName}
        size="sm"
        color={disabled ? theme.colors.iconMuted : theme.colors.iconDefault}
      />
    </Pressable>
  );
}

/** Button that scrolls to the previous slide; disables at the start. */
export function CarouselPrevious({ testID }: { testID?: string }) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return (
    <CarouselControl
      disabled={!canScrollPrev}
      onPress={scrollPrev}
      iconName={orientation === 'horizontal' ? 'chevron-left' : 'chevron-up'}
      label="Previous slide"
      testID={testID}
    />
  );
}

/** Button that scrolls to the next slide; disables at the end. */
export function CarouselNext({ testID }: { testID?: string }) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return (
    <CarouselControl
      disabled={!canScrollNext}
      onPress={scrollNext}
      iconName={orientation === 'horizontal' ? 'chevron-right' : 'chevron-down'}
      label="Next slide"
      testID={testID}
    />
  );
}

/** A row of dots reflecting the page count and the active slide. */
export function CarouselIndicators({ testID }: { testID?: string }) {
  const theme = useTheme<Theme>();
  const { count, activeIndex, orientation } = useCarousel();
  const diameter = theme.carouselIndicatorSize;

  if (count <= 0) {
    return null;
  }

  return (
    <Box
      flexDirection={orientation === 'horizontal' ? 'row' : 'column'}
      gap="xs"
      alignItems="center"
      justifyContent="center"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      testID={testID}
    >
      {Array.from({ length: count }, (_, index) => (
        <Box
          // biome-ignore lint/suspicious/noArrayIndexKey: dots are a fixed positional row keyed by slot index
          key={index}
          style={{
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            backgroundColor:
              index === activeIndex
                ? theme.colors.carouselIndicatorActive
                : theme.colors.carouselIndicatorDefault,
          }}
        />
      ))}
    </Box>
  );
}
