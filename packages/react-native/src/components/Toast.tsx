import type { IconName } from '@ghds/icons';
import { useTheme } from '@shopify/restyle';
import { type ReactNode, useEffect, useRef } from 'react';
import { Pressable, Modal as RNModal, View } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** Severity of a {@link Toast}. */
export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

/** Props for {@link Toast}. */
export interface ToastProps {
  open: boolean;
  onClose: () => void;
  variant?: ToastVariant;
  title?: string;
  children?: ReactNode;
  /** Auto-dismiss after this many ms; `0` to persist. Defaults to 5000. */
  duration?: number;
  testID?: string;
}

type ColorKey = keyof Theme['colors'];

const DEFAULT_DURATION = 5000;

const ICON: Record<ToastVariant, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'warning',
};

const STROKE: Record<ToastVariant, ColorKey> = {
  info: 'toastStrokeInfo',
  success: 'toastStrokeSuccess',
  warning: 'toastStrokeWarning',
  danger: 'toastStrokeDanger',
};

/**
 * A hand-drawn toast notification, shown over the app in a transparent `Modal`
 * anchored to the bottom and auto-dismissing after `duration`. Touches outside
 * the toast pass through (`pointerEvents="box-none"`). `danger` uses
 * `role="alert"`; the rest `role="status"`. Token-driven (`comp.toast.*`).
 */
export function Toast({
  open,
  onClose,
  variant = 'info',
  title,
  children,
  duration = DEFAULT_DURATION,
  testID,
}: ToastProps) {
  const theme = useTheme<Theme>();
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.toastSketch.roughness,
    bowing: theme.toastSketch.bowing,
  });
  const strokeHex = theme.colors[STROKE[variant]];
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open || duration <= 0) {
      return;
    }
    const timer = setTimeout(() => onCloseRef.current(), duration);
    return () => clearTimeout(timer);
  }, [open, duration]);

  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View
        pointerEvents="box-none"
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: theme.spacing.lg,
        }}
      >
        <Box
          onLayout={onLayout}
          flexDirection="row"
          alignItems="flex-start"
          padding="md"
          backgroundColor="toastBg"
          role={variant === 'danger' ? 'alert' : 'status'}
          accessibilityLiveRegion={variant === 'danger' ? 'assertive' : 'polite'}
          testID={testID}
          style={{ gap: theme.spacing.sm, maxWidth: 384 }}
        >
          <SketchBackground
            drawable={drawable}
            size={size}
            strokeColor={strokeHex}
            strokeWidth={theme.borderWidths.default}
          />
          <Icon name={ICON[variant]} size="sm" color={strokeHex} />
          <Box flex={1}>
            {title !== undefined && (
              <Text variant="label" color="toastTextTitle">
                {title}
              </Text>
            )}
            {typeof children === 'string' ? (
              <Text variant="body" color="toastTextBody">
                {children}
              </Text>
            ) : (
              children
            )}
          </Box>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss">
            <Icon name="close" size="sm" color={theme.colors.toastTextBody} />
          </Pressable>
        </Box>
      </View>
    </RNModal>
  );
}
