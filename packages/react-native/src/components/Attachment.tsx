import type { IconName } from '@ghds/icons';
import { useTheme } from '@shopify/restyle';
import { Pressable } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** Props for {@link Attachment}. */
export interface AttachmentProps {
  /** File (or resource) name shown as the primary label. */
  name: string;
  /** Secondary metadata, e.g. a human-readable size like `"2.4 MB"`. */
  meta?: string;
  /** Optional leading icon (a `@ghds/icons` name). */
  icon?: IconName;
  /** When provided, renders a remove button that calls this handler. */
  onRemove?: () => void;
  /** Accessible label for the remove button. Defaults to `Remove {name}`. */
  removeLabel?: string;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn attachment chip: an optional leading icon, a file name with
 * optional metadata, and an optional remove button. The sketchy box comes from
 * `@ghds/sketch-core`; every colour, padding, radius and sketch parameter comes
 * from `@ghds/tokens` (`comp.attachment.*`) via the Restyle theme.
 */
export function Attachment({ name, meta, icon, onRemove, removeLabel, testID }: AttachmentProps) {
  const theme = useTheme<Theme>();

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.attachmentSketch.roughness,
    bowing: theme.attachmentSketch.bowing,
    fillStyle: 'solid',
  });

  return (
    <Box
      onLayout={onLayout}
      flexDirection="row"
      alignItems="center"
      alignSelf="flex-start"
      gap="attachmentGap"
      paddingHorizontal="attachmentHorizontal"
      paddingVertical="attachmentVertical"
      borderRadius="attachment"
      testID={testID}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={theme.colors.attachmentStrokeDefault}
        fillColor={theme.colors.attachmentBgDefault}
        strokeWidth={theme.borderWidths.default}
      />
      {icon !== undefined ? (
        <Icon name={icon} size="sm" color={theme.colors.attachmentIconDefault} />
      ) : null}
      <Box flexDirection="column">
        <Text variant="label" color="attachmentTextName">
          {name}
        </Text>
        {meta !== undefined ? (
          <Text variant="caption" color="attachmentTextMeta">
            {meta}
          </Text>
        ) : null}
      </Box>
      {onRemove !== undefined ? (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={removeLabel ?? `Remove ${name}`}
        >
          <Icon name="close" size="sm" color={theme.colors.attachmentIconDefault} />
        </Pressable>
      ) : null}
    </Box>
  );
}
