import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { type GestureResponderEvent, Pressable } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Visual treatment of an {@link Item} row. */
export type ItemVariant = 'default' | 'muted' | 'outline';

/** Props for {@link Item}. */
export interface ItemProps {
  /**
   * Surface treatment. `'default'` is transparent; `'muted'` fills a subtle
   * background; `'outline'` draws a hand-drawn border. Defaults to `'default'`.
   */
  variant?: ItemVariant;
  /** Marks the row as the selected/active one (fills the selected background). */
  selected?: boolean;
  /** Row content — compose with the `Item*` sub-components. */
  children?: ReactNode;
  /** Press handler; when set the row is exposed as a button. */
  onPress?: (event: GestureResponderEvent) => void;
  /** Test handle for queries. */
  testID?: string;
  /** Accessible label for the row. */
  accessibilityLabel?: string;
}

/**
 * A flexible list-row primitive: a horizontal band of optional leading media,
 * a growing content column, and trailing actions. Compose it with
 * {@link ItemMedia}, {@link ItemContent}, {@link ItemTitle},
 * {@link ItemDescription} and {@link ItemActions}.
 *
 * The `'outline'` variant paints a sketchy border via `@ghds/sketch-core`; all
 * colours, spacing and sketch parameters come from `@ghds/tokens`
 * (`comp.item.*`) via the Restyle theme.
 */
export function Item({
  variant = 'default',
  selected = false,
  children,
  onPress,
  testID,
  accessibilityLabel,
}: ItemProps) {
  const theme = useTheme<Theme>();
  const outline = variant === 'outline';

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.itemSketch.roughness,
    bowing: theme.itemSketch.bowing,
  });

  let backgroundColor: 'itemBgSelected' | 'itemBgHover' | 'transparent';
  if (selected) {
    backgroundColor = 'itemBgSelected';
  } else if (variant === 'muted') {
    backgroundColor = 'itemBgHover';
  } else {
    backgroundColor = 'transparent';
  }

  const row = (
    <Box
      onLayout={onLayout}
      flexDirection="row"
      alignItems="center"
      gap="itemGap"
      paddingHorizontal="itemHorizontal"
      paddingVertical="itemVertical"
      borderRadius="item"
      backgroundColor={backgroundColor}
      testID={onPress ? undefined : testID}
      accessibilityLabel={onPress ? undefined : accessibilityLabel}
    >
      {outline ? (
        <SketchBackground
          drawable={drawable}
          size={size}
          strokeColor={theme.colors.itemStrokeDefault}
          strokeWidth={theme.borderWidths.default}
        />
      ) : null}
      {children}
    </Box>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {row}
      </Pressable>
    );
  }

  return row;
}

/** Leading media slot (icon, avatar, thumbnail). */
export function ItemMedia({ children }: { children?: ReactNode }) {
  return (
    <Box alignItems="center" justifyContent="center" flexShrink={0}>
      {children}
    </Box>
  );
}

/** Growing content column between the media and the actions. */
export function ItemContent({ children }: { children?: ReactNode }) {
  return (
    <Box flexDirection="column" gap="xs" flex={1} minWidth={0}>
      {children}
    </Box>
  );
}

/** Primary line of the content column. */
export function ItemTitle({ children }: { children?: ReactNode }) {
  return (
    <Text variant="label" color="itemTextTitle">
      {children}
    </Text>
  );
}

/** Secondary, muted line of the content column. */
export function ItemDescription({ children }: { children?: ReactNode }) {
  return (
    <Text variant="caption" color="itemTextDescription">
      {children}
    </Text>
  );
}

/** Trailing actions slot (buttons, badges, chevrons). */
export function ItemActions({ children }: { children?: ReactNode }) {
  return (
    <Box flexDirection="row" alignItems="center" gap="sm" flexShrink={0}>
      {children}
    </Box>
  );
}
