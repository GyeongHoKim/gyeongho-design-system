import { useTheme } from '@shopify/restyle';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Props for {@link Kbd}. */
export interface KbdProps {
  /** The key label, e.g. `⌘`, `Ctrl`, `Enter`. */
  children: string;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn keyboard key hint. The sketchy outline comes from
 * `@ghds/sketch-core` (rendered with `react-native-svg`); background, text
 * colour, radius and padding are all `comp.kbd` tokens from `@ghds/tokens` via
 * the Restyle theme. Exposed to assistive tech as text.
 */
export function Kbd({ children, testID }: KbdProps) {
  const theme = useTheme<Theme>();
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.kbdSketch.roughness,
    bowing: theme.kbdSketch.bowing,
  });

  return (
    <Box
      onLayout={onLayout}
      alignSelf="flex-start"
      backgroundColor="kbdBg"
      borderRadius="sm"
      paddingHorizontal="sm"
      paddingVertical="xs"
      testID={testID}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={theme.colors.kbdStroke}
        strokeWidth={theme.borderWidths.default}
      />
      <Text variant="caption" color="kbdText">
        {children}
      </Text>
    </Box>
  );
}
