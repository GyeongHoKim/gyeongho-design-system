import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Highlight tone of a {@link Marker}. */
export type MarkerVariant = 'default' | 'success' | 'info' | 'danger';

/** Props for {@link Marker}. */
export interface MarkerProps {
  /** Highlight colour. Defaults to `'default'` (a warm highlighter yellow). */
  variant?: MarkerVariant;
  /** The text to highlight. */
  children?: ReactNode;
  /** Test handle for queries. */
  testID?: string;
}

const VARIANT_COLOR = {
  default: 'markerColorDefault',
  success: 'markerColorSuccess',
  info: 'markerColorInfo',
  danger: 'markerColorDanger',
} as const;

/**
 * A hand-drawn highlighter. Paints a sketchy hachure scribble behind inline
 * text (`@ghds/sketch-core`) so the words stay readable through it. The
 * highlight colour comes from `@ghds/tokens` (`comp.marker.*`) via the Restyle
 * theme; the text colour is inherited, never set.
 */
export function Marker({ variant = 'default', children, testID }: MarkerProps) {
  const theme = useTheme<Theme>();
  const color = theme.colors[VARIANT_COLOR[variant]];

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.thick,
    roughness: theme.markerSketch.roughness,
    bowing: theme.markerSketch.bowing,
    fillStyle: 'hachure',
    hachureGap: theme.sketch.hachureGap,
    hachureAngle: theme.sketch.hachureAngle,
  });

  return (
    <Box onLayout={onLayout} alignSelf="flex-start" paddingHorizontal="xs" testID={testID}>
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={color}
        fillColor={color}
        strokeWidth={theme.borderWidths.thick}
      />
      <Text>{children}</Text>
    </Box>
  );
}
