import { useTheme } from '@shopify/restyle';
import { type ReactNode, useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import {
  type CardFastener,
  CardFastenerMark,
  type CardTilt,
  type CardTone,
  type CardVariant,
  cardAngle,
  LinedGuides,
  leanStyle,
  paperSurface,
} from './CardPaper.js';

export type { CardFastener, CardTilt, CardTone, CardVariant };

/** Props for {@link Card}. */
export interface CardProps {
  /** Card content. */
  children?: ReactNode;
  /** When `true`, draws an offset sketch shadow to express elevation. */
  elevated?: boolean;
  /**
   * Surface style: `plain` (sketch), or a `sticky` / `lined` paper. Any other
   * value renders as `plain`.
   */
  variant?: CardVariant;
  /** Paper colour of a `sticky` card and the pin head colour on every variant. */
  tone?: CardTone;
  /** Decorative tape or pin on the top edge; renders on every variant. */
  fastener?: CardFastener;
  /** Lean direction for paper variants (ignored for `plain`). */
  tilt?: CardTilt;
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
export function Card({
  children,
  elevated = false,
  variant = 'plain',
  tone = 'neutral',
  fastener = 'none',
  tilt = 'none',
  testID,
  accessibilityLabel,
}: CardProps) {
  const theme = useTheme<Theme>();
  // Anything other than a known paper variant renders as plain.
  const paper = variant === 'sticky' || variant === 'lined' ? variant : null;

  const {
    onLayout: onSketchLayout,
    size,
    drawable,
  } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.sketch.roughness,
    bowing: theme.sketch.bowing,
    elevation: elevated ? theme.spacing.xs : undefined,
  });
  const [linedHeight, setLinedHeight] = useState(0);
  // One handler, attached from mount for every variant: react-native-web only observes
  // layout when a handler is present at mount, so a variant switch must not add or drop it.
  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      setLinedHeight(e.nativeEvent.layout.height);
      onSketchLayout(e);
    },
    [onSketchLayout],
  );
  const angle = paper ? cardAngle(theme, paper, tilt) : 0;

  // One element tree for every variant: decorative layers sit in fixed slots, so
  // switching `variant` never remounts the children (their state survives).
  return (
    <Box
      onLayout={onLayout}
      backgroundColor={paper ? undefined : 'bgSurface'}
      borderRadius={paper ? undefined : 'md'}
      padding={paper ? undefined : 'md'}
      testID={testID}
      accessibilityRole={accessibilityLabel ? 'summary' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={[paper ? paperSurface(theme, paper, tone) : null, leanStyle(angle, fastener)]}
    >
      {paper ? null : (
        <SketchBackground
          drawable={drawable}
          size={size}
          strokeColor={theme.colors.borderDefault}
          strokeWidth={theme.borderWidths.default}
          shadowColor={elevated ? theme.colors.borderSubtle : undefined}
        />
      )}
      {paper === 'lined' ? <LinedGuides height={linedHeight} /> : null}
      {fastener !== 'none' ? <CardFastenerMark kind={fastener} tone={tone} angle={angle} /> : null}
      {children}
    </Box>
  );
}
