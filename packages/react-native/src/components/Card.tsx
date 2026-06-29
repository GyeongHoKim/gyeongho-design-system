import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Props for {@link Card}. */
export interface CardProps {
  /** Card content. */
  children?: ReactNode;
  /** When `true`, draws an offset sketch shadow to express elevation. */
  elevated?: boolean;
  /** Test handle for queries. */
  testID?: string;
  /** Accessible label; when set, the card is exposed as a grouped region. */
  accessibilityLabel?: string;
}

/**
 * Hand-drawn surface container. The sketchy border (and optional offset
 * elevation shadow) come from `@ghds/sketch-core`; the surface background,
 * radius, padding and stroke color are all Restyle theme tokens from
 * `@ghds/tokens`.
 */
export function Card({ children, elevated = false, testID, accessibilityLabel }: CardProps) {
  const theme = useTheme<Theme>();

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.sketch.roughness,
    bowing: theme.sketch.bowing,
    elevation: elevated ? theme.spacing.xs : undefined,
  });

  return (
    <Box
      onLayout={onLayout}
      backgroundColor="bgSurface"
      borderRadius="md"
      padding="md"
      testID={testID}
      accessibilityRole={accessibilityLabel ? 'summary' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={theme.colors.borderDefault}
        strokeWidth={theme.borderWidths.default}
        shadowColor={elevated ? theme.colors.borderSubtle : undefined}
      />
      {children}
    </Box>
  );
}
