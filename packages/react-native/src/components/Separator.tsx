import { line } from '@ghds/sketch-core';
import { useTheme } from '@shopify/restyle';
import { useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';
import { makeSeed } from '../sketch/options.js';
import { SketchBackground } from '../sketch/SketchBackground.js';
import type { Theme } from '../theme/theme.js';

/** Orientation of a {@link Separator}. */
export type SeparatorOrientation = 'horizontal' | 'vertical';

/** Props for {@link Separator}. */
export interface SeparatorProps {
  /** Line direction. Defaults to `'horizontal'`. */
  orientation?: SeparatorOrientation;
  /**
   * When `true`, the divider is purely decorative and hidden from assistive
   * tech; otherwise it is exposed with `accessibilityRole="none"` as a visual
   * separator. Defaults to `true`.
   */
  decorative?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn separator (divider). A single sketchy line from
 * `@ghds/sketch-core` (rendered with `react-native-svg`) spans the measured
 * length. Colour and thickness come from `@ghds/tokens` (`comp.separator.*`)
 * via the Restyle theme.
 */
export function Separator({
  orientation = 'horizontal',
  decorative = true,
  testID,
}: SeparatorProps) {
  const theme = useTheme<Theme>();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const seedRef = useRef<number | null>(null);
  if (seedRef.current === null) {
    seedRef.current = makeSeed();
  }
  const seed = seedRef.current;

  const isVertical = orientation === 'vertical';
  const thickness = theme.borderWidths.default;

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const drawable = useMemo(() => {
    if (size.width <= 0 || size.height <= 0) {
      return null;
    }
    const mid = isVertical ? size.width / 2 : size.height / 2;
    return isVertical
      ? line(mid, 0, mid, size.height, {
          roughness: theme.sketch.roughness,
          bowing: theme.sketch.bowing,
          seed,
        })
      : line(0, mid, size.width, mid, {
          roughness: theme.sketch.roughness,
          bowing: theme.sketch.bowing,
          seed,
        });
  }, [size, isVertical, seed, theme.sketch.roughness, theme.sketch.bowing]);

  return (
    <View
      onLayout={onLayout}
      testID={testID}
      accessibilityRole={decorative ? undefined : 'none'}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'auto'}
      style={
        isVertical
          ? { width: thickness, alignSelf: 'stretch' }
          : { height: thickness, alignSelf: 'stretch' }
      }
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={theme.colors.separatorColor}
        strokeWidth={theme.borderWidths.default}
      />
    </View>
  );
}
