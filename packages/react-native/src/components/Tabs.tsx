import { useTheme } from '@shopify/restyle';
import { type ReactNode, useState } from 'react';
import { Pressable } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** One tab and its panel content. */
export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

/** Props for {@link Tabs}. */
export interface TabsProps {
  items: TabItem[];
  /** Controlled active value. */
  value?: string;
  /** Initial active value when uncontrolled. Defaults to the first tab. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name for the tablist. */
  label?: string;
  /** Test handle for queries. */
  testID?: string;
}

type ColorKey = keyof Theme['colors'];

interface TabButtonProps {
  item: TabItem;
  selected: boolean;
  onPress: () => void;
}

function TabButton({ item, selected, onPress }: TabButtonProps) {
  const theme = useTheme<Theme>();
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.tabsSketch.roughness,
    bowing: theme.tabsSketch.bowing,
  });

  const textKey: ColorKey = item.disabled
    ? 'tabsTabTextDisabled'
    : selected
      ? 'tabsTabTextSelected'
      : 'tabsTabTextDefault';

  return (
    <Pressable
      onPress={item.disabled ? undefined : onPress}
      onLayout={onLayout}
      disabled={item.disabled}
      role="tab"
      accessibilityRole="tab"
      accessibilityState={{ selected, disabled: item.disabled }}
      // accessibilityState.selected has no react-native-web mapping; set the flat
      // aria-selected for the web target ([[ghds-rnw-prop-gaps]]).
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      style={{
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? theme.colors.tabsTabBgSelected : 'transparent',
      }}
    >
      {selected && (
        <SketchBackground
          drawable={drawable}
          size={size}
          strokeColor={theme.colors.tabsTabStrokeSelected}
          strokeWidth={theme.borderWidths.default}
        />
      )}
      <Text
        variant="body"
        color={textKey}
        fontWeight={selected ? theme.textVariants.label.fontWeight : undefined}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

/**
 * A hand-drawn tabbed interface (WAI-ARIA Tabs pattern). The active tab is
 * filled with a sketchy box (`@ghds/sketch-core`); colours and sketch parameters
 * come from `@ghds/tokens` via the Restyle theme (`comp.tabs.*`). Selection is by
 * press; the active tab is exposed via `accessibilityState.selected`.
 *
 * Known gap: arrow-key roving navigation (available on the React/Web-Component
 * builds) is not wired on React Native — `onKeyDown` is not part of RN's
 * `Pressable` (react-native-web only). Press/tap selection works everywhere.
 */
export function Tabs({ items, value, defaultValue, onValueChange, label, testID }: TabsProps) {
  const theme = useTheme<Theme>();
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const requested = value !== undefined ? value : internalValue;
  // Resolve to the requested tab only when it exists and is enabled; otherwise
  // fall back to the first enabled tab (keeps a disabled first tab from becoming
  // the active one, and recovers from a stale selection after `items` changes).
  const current =
    requested !== undefined && items.some((item) => item.value === requested && !item.disabled)
      ? requested
      : (items.find((item) => !item.disabled)?.value ?? items[0]?.value);

  const select = (next: string) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  return (
    <Box testID={testID}>
      <Box flexDirection="row" flexWrap="wrap" role="tablist" accessibilityLabel={label}>
        {items.map((item) => (
          <Box key={item.value} style={{ marginRight: theme.tabsGap }}>
            <TabButton
              item={item}
              selected={item.value === current}
              onPress={() => select(item.value)}
            />
          </Box>
        ))}
      </Box>
      {items.map((item) =>
        item.value === current ? (
          <Box key={item.value} role="tabpanel" paddingTop="md">
            {item.content}
          </Box>
        ) : null,
      )}
    </Box>
  );
}
