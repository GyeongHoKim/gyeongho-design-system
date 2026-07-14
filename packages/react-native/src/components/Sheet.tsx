import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { Pressable, Modal as RNModal, StyleSheet, type ViewStyle } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Which edge a {@link Sheet} is anchored to. */
export type SheetSide = 'left' | 'right' | 'top' | 'bottom';

/** Props for {@link Sheet}. */
export interface SheetProps {
  /** Whether the sheet is shown. */
  open: boolean;
  /** Called on scrim tap or hardware back. */
  onClose: () => void;
  /** Edge to anchor to. Defaults to `'right'`. */
  side?: SheetSide;
  /** Accessible title, rendered as a heading. */
  title?: string;
  /** Sheet content. */
  children?: ReactNode;
  /** Test handle for queries. */
  testID?: string;
}

function panelLayout(side: SheetSide): ViewStyle {
  switch (side) {
    case 'left':
      return { position: 'absolute', top: 0, bottom: 0, left: 0, width: '82%' };
    case 'right':
      return { position: 'absolute', top: 0, bottom: 0, right: 0, width: '82%' };
    case 'top':
      return { position: 'absolute', top: 0, left: 0, right: 0, maxHeight: '60%' };
    default:
      return { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '60%' };
  }
}

/**
 * A hand-drawn sheet: an edge-anchored side panel. Built on React Native's
 * `Modal` overlay (the same pattern as `Modal`/`AlertDialog`); the panel is
 * pinned to the chosen `side` and the scrim closes it. Colours and sketch
 * parameters come from `@ghds/tokens` (`comp.sheet.*`) via the Restyle theme.
 */
export function Sheet({ open, onClose, side = 'right', title, children, testID }: SheetProps) {
  const theme = useTheme<Theme>();
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.sheetSketch.roughness,
    bowing: theme.sheetSketch.bowing,
  });

  return (
    <RNModal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
    >
      <Pressable
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.colors.sheetScrim, opacity: theme.modalScrimOpacity },
        ]}
        accessibilityLabel="Close"
        onPress={onClose}
        testID={testID ? `${testID}-scrim` : undefined}
      />
      <Box
        onLayout={onLayout}
        role="dialog"
        aria-modal
        accessibilityViewIsModal
        accessibilityLabel={title}
        backgroundColor="sheetBg"
        padding="lg"
        style={panelLayout(side)}
      >
        <SketchBackground
          drawable={drawable}
          size={size}
          strokeColor={theme.colors.sheetStroke}
          strokeWidth={theme.borderWidths.default}
        />
        {title !== undefined && (
          <Text variant="title" color="textPrimary" marginBottom="md">
            {title}
          </Text>
        )}
        {typeof children === 'string' ? (
          <Text variant="body" color="textSecondary">
            {children}
          </Text>
        ) : (
          children
        )}
      </Box>
    </RNModal>
  );
}
