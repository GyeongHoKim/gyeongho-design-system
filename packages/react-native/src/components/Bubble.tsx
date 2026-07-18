import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Who sent the message a {@link Bubble} holds. */
export type BubbleVariant = 'received' | 'sent';

/** Props for {@link Bubble}. */
export interface BubbleProps {
  /**
   * `'received'` (default) is a muted incoming bubble; `'sent'` is a filled
   * outgoing bubble in the primary colour.
   */
  variant?: BubbleVariant;
  /** Bubble content. */
  children?: ReactNode;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn chat bubble. The sketchy rounded box (outline + solid fill) comes
 * from `@ghds/sketch-core`; colour, padding, radius and sketch parameters come
 * from `@ghds/tokens` (`comp.bubble.*`) via the Restyle theme. Sent bubbles use
 * the on-primary text colour over the primary fill; received bubbles use the
 * primary text colour over the muted fill. Alignment within a conversation is
 * the caller's concern (see {@link Message}); the bubble only paints itself.
 */
export function Bubble({ variant = 'received', children, testID }: BubbleProps) {
  const theme = useTheme<Theme>();
  const sent = variant === 'sent';

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.bubbleSketch.roughness,
    bowing: theme.bubbleSketch.bowing,
    fillStyle: 'solid',
  });

  return (
    <Box
      onLayout={onLayout}
      alignSelf="flex-start"
      maxWidth="100%"
      paddingHorizontal="bubbleHorizontal"
      paddingVertical="bubbleVertical"
      borderRadius="bubble"
      testID={testID}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={sent ? theme.colors.bubbleStrokeSent : theme.colors.bubbleStrokeReceived}
        fillColor={sent ? theme.colors.bubbleBgSent : theme.colors.bubbleBgReceived}
        strokeWidth={theme.borderWidths.default}
      />
      <Text variant="body" color={sent ? 'bubbleTextSent' : 'bubbleTextReceived'}>
        {children}
      </Text>
    </Box>
  );
}
