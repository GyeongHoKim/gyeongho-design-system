import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Semantic colour of a {@link Badge}. */
export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/** Props for {@link Badge}. */
export interface BadgeProps {
  /** Badge label. Pass a string (rendered inside a themed `Text`). */
  children?: ReactNode;
  /** Semantic colour role. Defaults to `'neutral'`. */
  variant?: BadgeVariant;
  /** Test handle for queries. */
  testID?: string;
  /** Accessible label; use for icon-only or numeric badges conveying state. */
  accessibilityLabel?: string;
}

type ColorKey = keyof Theme['colors'];

const BG: Record<BadgeVariant, ColorKey> = {
  neutral: 'badgeBgNeutral',
  primary: 'badgeBgPrimary',
  success: 'badgeBgSuccess',
  warning: 'badgeBgWarning',
  danger: 'badgeBgDanger',
  info: 'badgeBgInfo',
};

const TEXT: Record<BadgeVariant, ColorKey> = {
  neutral: 'badgeTextNeutral',
  primary: 'badgeTextPrimary',
  success: 'badgeTextSuccess',
  warning: 'badgeTextWarning',
  danger: 'badgeTextDanger',
  info: 'badgeTextInfo',
};

const STROKE: Record<BadgeVariant, ColorKey> = {
  neutral: 'badgeStrokeNeutral',
  primary: 'badgeStrokePrimary',
  success: 'badgeStrokeSuccess',
  warning: 'badgeStrokeWarning',
  danger: 'badgeStrokeDanger',
  info: 'badgeStrokeInfo',
};

/**
 * A small hand-drawn status/label pill. The sketchy outline comes from
 * `@ghds/sketch-core` (rendered with `react-native-svg`) over a solid,
 * token-driven background; every colour and sketch parameter is sourced from
 * `@ghds/tokens` via the Restyle theme (`comp.badge.*`).
 */
export function Badge({ children, variant = 'neutral', testID, accessibilityLabel }: BadgeProps) {
  const theme = useTheme<Theme>();

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.badgeSketch.roughness,
    bowing: theme.badgeSketch.bowing,
  });

  return (
    <Box
      onLayout={onLayout}
      alignSelf="flex-start"
      flexDirection="row"
      alignItems="center"
      paddingHorizontal="sm"
      paddingVertical="xs"
      borderRadius="pill"
      backgroundColor={BG[variant]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={theme.colors[STROKE[variant]]}
        strokeWidth={theme.borderWidths.default}
      />
      <Text variant="caption" color={TEXT[variant]}>
        {children}
      </Text>
    </Box>
  );
}
