import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { ScrollView, type StyleProp, type ViewStyle } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Which axis (or axes) a {@link ScrollArea} scrolls. */
export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

/** Props for {@link ScrollArea}. */
export interface ScrollAreaProps {
  /** Scroll axis. Defaults to `'vertical'`. */
  orientation?: ScrollAreaOrientation;
  /** Scrollable content. */
  children?: ReactNode;
  /** Extra style merged onto the bordered box (constrain height/width here). */
  style?: StyleProp<ViewStyle>;
  /** Test handle for queries. */
  testID?: string;
  /** Accessible label for the scroll region. */
  accessibilityLabel?: string;
}

/**
 * A bounded, hand-drawn scroll viewport. Draws a sketchy border
 * (`@ghds/sketch-core`) around a native `ScrollView`. Unlike the web build, RN
 * cannot theme the native scrollbar, so the platform scroll indicators are kept
 * as-is. Constrain the viewport by passing a `maxHeight`/`height` (or width) via
 * `style`; content taller than that scrolls.
 */
export function ScrollArea({
  orientation = 'vertical',
  children,
  style,
  testID,
  accessibilityLabel,
}: ScrollAreaProps) {
  const theme = useTheme<Theme>();
  const horizontal = orientation === 'horizontal';
  const both = orientation === 'both';

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.scrollAreaSketch.roughness,
    bowing: theme.scrollAreaSketch.bowing,
  });

  const inner = both ? (
    <ScrollView>
      <ScrollView horizontal>{children}</ScrollView>
    </ScrollView>
  ) : (
    <ScrollView horizontal={horizontal}>{children}</ScrollView>
  );

  return (
    <Box
      onLayout={onLayout}
      padding="sm"
      borderRadius="scrollArea"
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={theme.colors.scrollAreaThumbDefault}
        strokeWidth={theme.borderWidths.default}
      />
      {inner}
    </Box>
  );
}
