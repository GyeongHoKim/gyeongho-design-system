import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, type ButtonProps } from './Button.js';
import { Icon } from './Icon.js';

/** Scroll axis of a {@link Carousel}. */
export type CarouselOrientation = 'horizontal' | 'vertical';

interface CarouselContextValue {
  readonly orientation: CarouselOrientation;
  readonly setViewport: (node: HTMLDivElement | null) => void;
  readonly scrollPrev: () => void;
  readonly scrollNext: () => void;
  readonly canScrollPrev: boolean;
  readonly canScrollNext: boolean;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarousel(): CarouselContextValue {
  const ctx = useContext(CarouselContext);
  if (!ctx) {
    throw new Error('Carousel subcomponents must be rendered inside a <Carousel>');
  }
  return ctx;
}

const carousel = tokens.comp.carousel;

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /** Scroll axis. Defaults to `'horizontal'`. */
  orientation?: CarouselOrientation;
}

/**
 * A hand-drawn carousel built on native scroll-snap — no third-party engine.
 * Compose it with {@link CarouselContent}, {@link CarouselItem},
 * {@link CarouselPrevious} and {@link CarouselNext}. The root is a
 * `role="region"` labelled as a carousel and moves one viewport per step;
 * arrow keys scroll along the orientation axis.
 */
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(function Carousel(
  { orientation = 'horizontal', children, style, onKeyDown, ...rest },
  forwardedRef,
) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const horizontal = orientation === 'horizontal';

  const update = useCallback(() => {
    const el = viewportRef.current;
    if (!el) {
      return;
    }
    const start = horizontal ? el.scrollLeft : el.scrollTop;
    const total = horizontal ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight;
    setCanScrollPrev(start > 1);
    setCanScrollNext(start < total - 1);
  }, [horizontal]);

  const setViewport = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      update();
    },
    [update],
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) {
      return;
    }
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [update]);

  const scrollByStep = useCallback(
    (direction: 1 | -1) => {
      const el = viewportRef.current;
      if (!el) {
        return;
      }
      const amount = horizontal ? el.clientWidth : el.clientHeight;
      el.scrollBy({ [horizontal ? 'left' : 'top']: direction * amount, behavior: 'smooth' });
    },
    [horizontal],
  );

  const scrollPrev = useCallback(() => scrollByStep(-1), [scrollByStep]);
  const scrollNext = useCallback(() => scrollByStep(1), [scrollByStep]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const prevKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    if (event.key === prevKey) {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === nextKey) {
      event.preventDefault();
      scrollNext();
    }
    onKeyDown?.(event);
  };

  const rootStyle: CSSProperties = {
    position: 'relative',
    ...style,
  };

  const contextValue: CarouselContextValue = {
    orientation,
    setViewport,
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext,
  };

  return (
    <CarouselContext.Provider value={contextValue}>
      {/* biome-ignore lint/a11y/useSemanticElements: role="region" + aria-roledescription is the ARIA APG carousel pattern; a <section> cannot carry the "carousel" roledescription the same way. */}
      <div
        ref={forwardedRef}
        role="region"
        aria-roledescription="carousel"
        style={rootStyle}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});

/** The scroll-snap track that holds the {@link CarouselItem}s. */
export const CarouselContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CarouselContent({ children, style, ...rest }, forwardedRef) {
    const { orientation, setViewport } = useCarousel();
    const horizontal = orientation === 'horizontal';

    const viewportStyle: CSSProperties = {
      display: 'flex',
      flexDirection: horizontal ? 'row' : 'column',
      gap: carousel.gap,
      overflowX: horizontal ? 'auto' : 'hidden',
      overflowY: horizontal ? 'hidden' : 'auto',
      scrollSnapType: `${horizontal ? 'x' : 'y'} mandatory`,
      scrollbarWidth: 'none',
      ...style,
    };

    return (
      <div
        ref={(node) => {
          setViewport(node);
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        style={viewportStyle}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

/** A single slide. Defaults to one-per-view; override `flexBasis` via `style`. */
export const CarouselItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CarouselItem({ children, style, ...rest }, forwardedRef) {
    const itemStyle: CSSProperties = {
      flex: '0 0 100%',
      minWidth: 0,
      scrollSnapAlign: 'start',
      ...style,
    };
    return (
      // biome-ignore lint/a11y/useSemanticElements: role="group" + aria-roledescription="slide" is the ARIA APG carousel-slide pattern; a <fieldset> is not an appropriate slide container.
      <div ref={forwardedRef} role="group" aria-roledescription="slide" style={itemStyle} {...rest}>
        {children}
      </div>
    );
  },
);

/** Button that scrolls to the previous slide; disables at the start. */
export const CarouselPrevious = forwardRef<HTMLButtonElement, ButtonProps>(
  function CarouselPrevious({ variant = 'neutral', onClick, ...rest }, forwardedRef) {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();
    return (
      <Button
        ref={forwardedRef}
        variant={variant}
        aria-label="Previous slide"
        disabled={!canScrollPrev}
        onClick={(event) => {
          scrollPrev();
          onClick?.(event);
        }}
        {...rest}
      >
        <Icon name={orientation === 'horizontal' ? 'chevron-left' : 'chevron-up'} size="sm" />
      </Button>
    );
  },
);

/** Button that scrolls to the next slide; disables at the end. */
export const CarouselNext = forwardRef<HTMLButtonElement, ButtonProps>(function CarouselNext(
  { variant = 'neutral', onClick, ...rest },
  forwardedRef,
) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return (
    <Button
      ref={forwardedRef}
      variant={variant}
      aria-label="Next slide"
      disabled={!canScrollNext}
      onClick={(event) => {
        scrollNext();
        onClick?.(event);
      }}
      {...rest}
    >
      <Icon name={orientation === 'horizontal' ? 'chevron-right' : 'chevron-down'} size="sm" />
    </Button>
  );
});
