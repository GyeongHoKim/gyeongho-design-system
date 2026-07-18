import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { type NativeScrollEvent, type NativeSyntheticEvent, ScrollView } from 'react-native';
import type { Theme } from '../theme/theme.js';

/** Props for {@link MessageScroller}. */
export interface MessageScrollerProps {
  /**
   * Keep the view pinned to the newest message. When the user scrolls up to
   * read history, auto-scrolling pauses until they return to the bottom.
   * Defaults to `true`.
   */
  stickToBottom?: boolean;
  /** The vertical stack of messages. */
  children?: ReactNode;
  /** Test handle for queries. */
  testID?: string;
}

/** How close (px) to the bottom still counts as "following the conversation". */
const NEAR_BOTTOM_THRESHOLD = 32;

/**
 * A hand-drawn auto-scrolling chat log. Lays its children out as a vertical
 * stack inside a `ScrollView` and, while the reader is at the bottom, keeps the
 * newest message in view as content grows — pausing the moment they scroll up.
 * Gap and padding come from `@ghds/tokens` (`comp.messageScroller.*`) via the
 * Restyle theme. Constrain the height via the surrounding layout.
 */
export function MessageScroller({ stickToBottom = true, children, testID }: MessageScrollerProps) {
  const theme = useTheme<Theme>();
  const scrollRef = useRef<ScrollView | null>(null);
  const nearBottomRef = useRef(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distance = contentSize.height - contentOffset.y - layoutMeasurement.height;
    nearBottomRef.current = distance <= NEAR_BOTTOM_THRESHOLD;
  };

  const handleContentSizeChange = () => {
    if (stickToBottom && nearBottomRef.current) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      testID={testID}
      scrollEventThrottle={16}
      onScroll={handleScroll}
      onContentSizeChange={handleContentSizeChange}
      contentContainerStyle={{
        gap: theme.spacing.messageScrollerGap,
        padding: theme.spacing.messageScrollerPadding,
      }}
    >
      {children}
    </ScrollView>
  );
}
