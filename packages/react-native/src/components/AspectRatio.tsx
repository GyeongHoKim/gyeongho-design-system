import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Box } from '../theme/primitives.js';

/** Props for {@link AspectRatio}. */
export interface AspectRatioProps {
  /**
   * Desired width-to-height ratio, e.g. `16 / 9` for widescreen media or `1`
   * for a square. Defaults to `1`.
   */
  ratio?: number;
  /** Content constrained to the ratio box. */
  children?: ReactNode;
  /** Extra style merged onto the ratio box. */
  style?: StyleProp<ViewStyle>;
  /** Test handle for queries. */
  testID?: string;
  /** Accessible label for the region. */
  accessibilityLabel?: string;
}

/**
 * A layout primitive that constrains its content to a fixed width-to-height
 * ratio using React Native's native `aspectRatio` style prop. Purely
 * structural — it owns no design values and paints nothing, so there is no
 * sketch layer.
 *
 * Size a single child to `width: '100%'`/`height: '100%'` (e.g. an `<Image>`
 * with `resizeMode="cover"`) to fill the ratio box.
 */
export function AspectRatio({
  ratio = 1,
  children,
  style,
  testID,
  accessibilityLabel,
}: AspectRatioProps) {
  return (
    <Box
      style={[
        { aspectRatio: ratio, width: '100%', overflow: 'hidden', position: 'relative' },
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Box>
  );
}
