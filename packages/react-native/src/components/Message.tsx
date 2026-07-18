import type { ReactNode } from 'react';
import { Box, Text } from '../theme/primitives.js';

/** Which side of the conversation a {@link Message} sits on. */
export type MessageSide = 'received' | 'sent';

/** Props for {@link Message}. */
export interface MessageProps {
  /** `'received'` (default) aligns to the start; `'sent'` aligns to the end. */
  side?: MessageSide;
  /** Row content — compose with the `Message*` sub-components. */
  children?: ReactNode;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn chat message row: an optional {@link MessageAvatar}, then a
 * {@link MessageContent} column (author + timestamp header and a `Bubble`).
 * `side` flips the layout so outgoing messages align to the end. Spacing and
 * text colours come from `@ghds/tokens` (`comp.message.*`) via the Restyle
 * theme.
 */
export function Message({ side = 'received', children, testID }: MessageProps) {
  return (
    <Box
      flexDirection={side === 'sent' ? 'row-reverse' : 'row'}
      alignItems="flex-start"
      gap="messageRowGap"
      testID={testID}
    >
      {children}
    </Box>
  );
}

/** Leading avatar slot for a {@link Message}. */
export function MessageAvatar({ children }: { children?: ReactNode }) {
  return <Box flexShrink={0}>{children}</Box>;
}

/** The stacked content column (header + bubble) of a {@link Message}. */
export function MessageContent({ children }: { children?: ReactNode }) {
  return (
    <Box flexDirection="column" gap="messageGap" minWidth={0}>
      {children}
    </Box>
  );
}

/** The author name shown above a message's bubble. */
export function MessageAuthor({ children }: { children?: ReactNode }) {
  return (
    <Text variant="label" color="messageTextAuthor">
      {children}
    </Text>
  );
}

/** The timestamp shown alongside the author of a message. */
export function MessageTimestamp({ children }: { children?: ReactNode }) {
  return (
    <Text variant="caption" color="messageTextTimestamp">
      {children}
    </Text>
  );
}
