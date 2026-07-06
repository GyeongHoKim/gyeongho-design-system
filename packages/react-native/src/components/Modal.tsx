import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { Pressable, Modal as RNModal, StyleSheet } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Props for {@link Modal}. */
export interface ModalProps {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Called when the user requests to close (scrim tap, hardware back). */
  onClose: () => void;
  /** Accessible title, rendered as a heading. */
  title?: string;
  /** Dialog body. */
  children?: ReactNode;
  /** Close when the scrim is tapped. Defaults to `true`. */
  closeOnScrimClick?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn modal dialog. Built on React Native's `Modal` (which owns focus
 * containment, the hardware back button, and the top layer); the scrim and the
 * sketchy panel (`@ghds/sketch-core`) are token-driven (`comp.modal.*`). Exposed
 * as `role="dialog"` with `aria-modal`. Colours come from the Restyle theme.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  closeOnScrimClick = true,
  testID,
}: ModalProps) {
  const theme = useTheme<Theme>();
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.modalSketch.roughness,
    bowing: theme.modalSketch.bowing,
  });

  return (
    <RNModal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
    >
      <Box flex={1} alignItems="center" justifyContent="center" padding="lg">
        {/* Scrim as its own layer so its opacity does not fade the panel. */}
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.modalScrimColor, opacity: theme.modalScrimOpacity },
          ]}
          accessibilityLabel="Close dialog"
          onPress={closeOnScrimClick ? onClose : undefined}
        />
        <Box
          onLayout={onLayout}
          role="dialog"
          aria-modal
          accessibilityViewIsModal
          accessibilityLabel={title}
          backgroundColor="modalPanelBg"
          padding="lg"
          style={{ maxWidth: 512, width: '100%' }}
        >
          <SketchBackground
            drawable={drawable}
            size={size}
            strokeColor={theme.colors.modalPanelStroke}
            strokeWidth={theme.borderWidths.default}
          />
          {title && (
            <Text variant="title" color="modalTextTitle" marginBottom="md">
              {title}
            </Text>
          )}
          {typeof children === 'string' ? (
            <Text variant="body" color="modalTextBody">
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
