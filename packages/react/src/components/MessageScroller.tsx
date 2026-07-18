import { tokens } from '@ghds/tokens';
import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import { cssVars } from '../lib/cssVars.js';
import { mergeRefs } from '../lib/mergeRefs.js';

export interface MessageScrollerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Keep the view pinned to the newest message. When the user scrolls up to
   * read history, auto-scrolling pauses until they return to the bottom.
   * Defaults to `true`.
   */
  stickToBottom?: boolean;
}

const messageScroller = tokens.comp.messageScroller;
const c = cssVars.comp.messageScroller;
/** How close (px) to the bottom still counts as "following the conversation". */
const NEAR_BOTTOM_THRESHOLD = 32;

/**
 * A hand-drawn auto-scrolling chat log. Lays its children out as a vertical
 * stack in a scroll viewport and, while the reader is at the bottom, keeps the
 * newest message in view as content grows — pausing the moment they scroll up.
 * Spacing and the themed scrollbar come from `@ghds/tokens`
 * (`comp.messageScroller.*`). Constrain the height via `style`.
 */
export const MessageScroller = forwardRef<HTMLDivElement, MessageScrollerProps>(
  function MessageScroller(
    { stickToBottom = true, children, style, onScroll, ...rest },
    forwardedRef,
  ) {
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const nearBottomRef = useRef(true);

    const isNearBottom = useCallback((el: HTMLDivElement) => {
      return el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_THRESHOLD;
    }, []);

    // Runs after every commit (i.e. whenever children change): if the reader is
    // following along at the bottom, keep the newest message in view.
    useLayoutEffect(() => {
      const el = viewportRef.current;
      if (!el || !stickToBottom || !nearBottomRef.current) {
        return;
      }
      el.scrollTop = el.scrollHeight;
    });

    const ref = mergeRefs(viewportRef, forwardedRef);

    const viewportStyle: CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: messageScroller.gap,
      boxSizing: 'border-box',
      padding: messageScroller.padding,
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollbarWidth: 'thin',
      scrollbarColor: `${c.thumb.default} ${c.track.default}`,
      ...style,
    };

    return (
      <div
        ref={ref}
        style={viewportStyle}
        onScroll={(event) => {
          nearBottomRef.current = isNearBottom(event.currentTarget);
          onScroll?.(event);
        }}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
