import { useTheme } from '@shopify/restyle';
import { Pressable, Modal as RNModal, StyleSheet } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Button } from './Button.js';

/** Props for {@link AlertDialog}. */
export interface AlertDialogProps {
  /** Whether the dialog is shown. */
  open: boolean;
  /** Called when the user cancels (cancel button, scrim tap, hardware back). */
  onCancel: () => void;
  /** Called when the user confirms. */
  onConfirm: () => void;
  /** Accessible title, rendered as the heading. */
  title: string;
  /** Supporting description. */
  description?: string;
  /** Cancel button label. Defaults to `'Cancel'`. */
  cancelLabel?: string;
  /** Confirm button label. Defaults to `'Confirm'`. */
  confirmLabel?: string;
  /** Styles the confirm action as destructive. Defaults to `false`. */
  destructive?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn alert dialog: a confirmation modal with a title, description and
 * an explicit cancel + confirm action pair. Built on React Native's `Modal`
 * (focus containment, hardware back, top layer) — the same overlay pattern as
 * `Modal` — and exposed as `role="alertdialog"`. Unlike `Modal`, tapping the
 * scrim cancels but the dialog always presents a decision. Colours come from
 * `@ghds/tokens` (`comp.alertDialog.*`).
 */
export function AlertDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  destructive = false,
  testID,
}: AlertDialogProps) {
  const theme = useTheme<Theme>();
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.alertDialogSketch.roughness,
    bowing: theme.alertDialogSketch.bowing,
  });

  const strokeColor = destructive
    ? theme.colors.alertDialogDangerStroke
    : theme.colors.alertDialogStroke;

  return (
    <RNModal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      testID={testID}
    >
      <Box flex={1} alignItems="center" justifyContent="center" padding="lg">
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.alertDialogScrim, opacity: theme.modalScrimOpacity },
          ]}
          accessibilityLabel="Cancel"
          onPress={onCancel}
        />
        <Box
          onLayout={onLayout}
          role="alertdialog"
          aria-modal
          accessibilityViewIsModal
          accessibilityLabel={title}
          backgroundColor="alertDialogBg"
          padding="lg"
          style={{ maxWidth: 440, width: '100%' }}
        >
          <SketchBackground
            drawable={drawable}
            size={size}
            strokeColor={strokeColor}
            strokeWidth={theme.borderWidths.default}
          />
          <Text variant="title" color="alertDialogTextTitle" marginBottom="sm">
            {title}
          </Text>
          {description !== undefined && (
            <Text variant="body" color="alertDialogTextBody" marginBottom="lg">
              {description}
            </Text>
          )}
          <Box flexDirection="row" justifyContent="flex-end" gap="sm">
            <Button
              label={cancelLabel}
              onPress={onCancel}
              testID={testID ? `${testID}-cancel` : undefined}
            />
            <Button
              label={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              testID={testID ? `${testID}-confirm` : undefined}
            />
          </Box>
        </Box>
      </Box>
    </RNModal>
  );
}
