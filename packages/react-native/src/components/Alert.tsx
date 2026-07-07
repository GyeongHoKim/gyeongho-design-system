import type { IconName } from '@ghds/icons';
import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** Severity of an {@link Alert}. */
export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

/** Props for {@link Alert}. */
export interface AlertProps {
  variant?: AlertVariant;
  /** Optional bold title. */
  title?: string;
  /** Message body. */
  children?: ReactNode;
  /** When provided, renders a dismiss button that calls this. */
  onDismiss?: () => void;
  /** Test handle for queries. */
  testID?: string;
}

type ColorKey = keyof Theme['colors'];

const ICON: Record<AlertVariant, IconName> = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'warning',
};

const STROKE: Record<AlertVariant, ColorKey> = {
  info: 'alertStrokeInfo',
  success: 'alertStrokeSuccess',
  warning: 'alertStrokeWarning',
  danger: 'alertStrokeDanger',
};

/**
 * A hand-drawn inline alert/banner. A sketchy box (`@ghds/sketch-core`) with a
 * severity-coloured outline + icon and a message. `danger` uses `role="alert"`;
 * the rest `role="status"`. Colours and sketch parameters come from
 * `@ghds/tokens` via the Restyle theme (`comp.alert.*`).
 */
export function Alert({ variant = 'info', title, children, onDismiss, testID }: AlertProps) {
  const theme = useTheme<Theme>();
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.alertSketch.roughness,
    bowing: theme.alertSketch.bowing,
  });
  const strokeHex = theme.colors[STROKE[variant]];

  return (
    <Box
      onLayout={onLayout}
      flexDirection="row"
      alignItems="flex-start"
      padding="md"
      style={{ gap: theme.spacing.sm }}
      backgroundColor="alertBg"
      role={variant === 'danger' ? 'alert' : 'status'}
      accessibilityLiveRegion={variant === 'danger' ? 'assertive' : 'polite'}
      testID={testID}
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
          <Text variant="label" color="alertTextTitle">
            {title}
          </Text>
        )}
        {typeof children === 'string' ? (
          <Text variant="body" color="alertTextBody">
            {children}
          </Text>
        ) : (
          children
        )}
      </Box>
      {onDismiss && (
        <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Dismiss">
          <Icon name="close" size="sm" color={theme.colors.alertTextBody} />
        </Pressable>
      )}
    </Box>
  );
}
