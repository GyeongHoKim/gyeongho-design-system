import { useTheme } from '@shopify/restyle';
import { type ReactNode, useState } from 'react';
import { Pressable } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Props for {@link Tooltip}. */
export interface TooltipProps {
  /** Tooltip text. */
  content: string;
  /** The trigger element. */
  children: ReactNode;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn tooltip. React Native has no hover, so the tooltip is toggled by
 * tapping the trigger; the sketchy bubble (`@ghds/sketch-core`) appears above
 * it. Colours and sketch parameters come from `@ghds/tokens` via the Restyle
 * theme (`comp.tooltip.*`). The trigger exposes the content as an accessibility
 * hint so it is announced without needing hover.
 */
export function Tooltip({ content, children, testID }: TooltipProps) {
  const theme = useTheme<Theme>();
  const [visible, setVisible] = useState(false);
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.tooltipSketch.roughness,
    bowing: theme.tooltipSketch.bowing,
  });

  return (
    <Box style={{ position: 'relative', alignSelf: 'flex-start' }} testID={testID}>
      <Pressable
        onPress={() => setVisible((v) => !v)}
        accessibilityHint={content}
        accessibilityState={{ expanded: visible }}
      >
        {children}
      </Pressable>
      {visible && (
        <Box
          onLayout={onLayout}
          role="tooltip"
          accessibilityLabel={content}
          style={{
            position: 'absolute',
            bottom: '100%',
            marginBottom: theme.spacing.xs,
            // Layout max-width, kept in sync with the web builds' 16rem (256px).
            maxWidth: 256,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            backgroundColor: theme.colors.tooltipBg,
          }}
        >
          <SketchBackground
            drawable={drawable}
            size={size}
            strokeColor={theme.colors.tooltipStroke}
            strokeWidth={theme.borderWidths.default}
          />
          <Text variant="caption" color="tooltipText">
            {content}
          </Text>
        </Box>
      )}
    </Box>
  );
}
