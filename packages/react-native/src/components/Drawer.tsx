import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { Pressable, Modal as RNModal, StyleSheet } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Props for {@link Drawer}. */
export interface DrawerProps {
  /** Whether the drawer is shown. */
  open: boolean;
  /** Called on scrim tap or hardware back. */
  onClose: () => void;
  /** Accessible title, rendered as a heading. */
  title?: string;
  /** Drawer content. */
  children?: ReactNode;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn drawer: a bottom sheet that rises from the bottom edge with a
 * grab handle. Built on React Native's `Modal` (using its native `slide`
 * animation from the bottom) — the touch-native counterpart to a desktop
 * dialog. Colours and sketch parameters come from `@ghds/tokens`
 * (`comp.drawer.*`) via the Restyle theme.
 */
export function Drawer({ open, onClose, title, children, testID }: DrawerProps) {
  const theme = useTheme<Theme>();
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.drawerSketch.roughness,
    bowing: theme.drawerSketch.bowing,
  });

  return (
    <RNModal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}
    >
      <Box flex={1} justifyContent="flex-end">
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.drawerScrim, opacity: theme.modalScrimOpacity },
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
          backgroundColor="drawerBg"
          padding="lg"
          style={{ maxHeight: '80%' }}
        >
          <SketchBackground
            drawable={drawable}
            size={size}
            strokeColor={theme.colors.drawerStroke}
            strokeWidth={theme.borderWidths.default}
          />
          {/* Grab handle. */}
          <Box
            alignSelf="center"
            marginBottom="md"
            borderRadius="pill"
            style={{
              width: theme.spacing.xl,
              height: theme.spacing.xs,
              backgroundColor: theme.colors.drawerStroke,
            }}
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
      </Box>
    </RNModal>
  );
}
