import { useTheme } from '@shopify/restyle';
import { type ReactNode, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, type View } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Props for {@link HoverCard}. */
export interface HoverCardProps {
  /** The trigger content. */
  trigger: ReactNode;
  /** Card content shown when opened. */
  children: ReactNode;
  /** Accessible label for the trigger. */
  triggerLabel: string;
  /** Test handle for queries. */
  testID?: string;
}

interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A hand-drawn hover card. React Native (and touch in general) has no hover, so
 * — unlike the web build that opens on pointer-enter — this adaptation opens on
 * **long-press** and closes on tap-outside. It is otherwise a floating card
 * anchored to the trigger via the `Modal` portal pattern. Colours come from
 * `@ghds/tokens` (`comp.hoverCard.*`) via the Restyle theme.
 */
export function HoverCard({ trigger, children, triggerLabel, testID }: HoverCardProps) {
  const theme = useTheme<Theme>();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const triggerRef = useRef<View>(null);

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.hoverCardSketch.roughness,
    bowing: theme.hoverCardSketch.bowing,
  });

  const handleOpen = () => {
    setOpen(true);
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        onLongPress={handleOpen}
        delayLongPress={250}
        accessibilityRole="button"
        accessibilityLabel={triggerLabel}
        accessibilityHint="Long-press to preview"
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
        testID={testID}
        style={{ alignSelf: 'flex-start' }}
      >
        {trigger}
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Close preview"
          onPress={() => setOpen(false)}
          testID={testID ? `${testID}-scrim` : undefined}
        />
        {open && (
          <Box
            onLayout={onLayout}
            role="dialog"
            accessibilityLabel={triggerLabel}
            backgroundColor="hoverCardBg"
            paddingHorizontal="md"
            paddingVertical="sm"
            borderRadius="md"
            style={{
              position: 'absolute',
              top: (anchor ? anchor.y + anchor.height : 0) + theme.spacing.xs,
              left: anchor?.x ?? 0,
              minWidth: Math.max(anchor?.width ?? 0, theme.spacing['2xl'] * 5),
              maxWidth: theme.spacing['2xl'] * 6,
            }}
          >
            <SketchBackground
              drawable={drawable}
              size={size}
              strokeColor={theme.colors.hoverCardStroke}
              strokeWidth={theme.borderWidths.default}
              shadowColor={theme.colors.borderSubtle}
            />
            {children}
          </Box>
        )}
      </Modal>
    </>
  );
}
