import { useTheme } from '@shopify/restyle';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, type View } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** A leaf link within a {@link NavigationMenuItem}. */
export interface NavigationMenuLink {
  value: string;
  label: string;
  description?: string;
}

/** One top-level entry in a {@link NavigationMenu}. */
export interface NavigationMenuItem {
  value: string;
  label: string;
  /** When present, tapping opens a panel of these links instead of selecting. */
  links?: NavigationMenuLink[];
}

/** Props for {@link NavigationMenu}. */
export interface NavigationMenuProps {
  /** The top-level entries. */
  items: NavigationMenuItem[];
  /** Currently active value (a top-level or link value). */
  value?: string;
  /** Called with the activated leaf/link value. */
  onSelect?: (value: string) => void;
  /** Accessible label. */
  accessibilityLabel?: string;
  /** Test handle for queries. */
  testID?: string;
}

interface Anchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A hand-drawn navigation menu. The desktop web build reveals content panels on
 * hover; touch has no hover, so an entry with `links` opens its panel on **tap**
 * (via the `Modal` portal pattern) and a leaf entry selects immediately. The
 * whole bar scrolls horizontally on narrow screens. Colours come from
 * `@ghds/tokens` (`comp.navigationMenu.*`) via the Restyle theme.
 */
export function NavigationMenu({
  items,
  value,
  onSelect,
  accessibilityLabel,
  testID,
}: NavigationMenuProps) {
  const theme = useTheme<Theme>();
  const [openValue, setOpenValue] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const triggerRefs = useRef<Record<string, View | null>>({});

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.navigationMenuSketch.roughness,
    bowing: theme.navigationMenuSketch.bowing,
  });

  const openItem = items.find((item) => item.value === openValue) ?? null;

  const handleTrigger = (item: NavigationMenuItem) => {
    if (item.links && item.links.length > 0) {
      setOpenValue(item.value);
      triggerRefs.current[item.value]?.measureInWindow((x, y, width, height) => {
        setAnchor({ x, y, width, height });
      });
    } else {
      onSelect?.(item.value);
    }
  };

  const selectLink = (link: NavigationMenuLink) => {
    onSelect?.(link.value);
    setOpenValue(null);
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="menubar"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        contentContainerStyle={{ gap: theme.spacing.xs, padding: theme.spacing.xs }}
      >
        {items.map((item) => {
          const active = item.value === value;
          const hasLinks = Boolean(item.links && item.links.length > 0);
          return (
            <Pressable
              key={item.value}
              ref={(node) => {
                triggerRefs.current[item.value] = node;
              }}
              onPress={() => handleTrigger(item)}
              accessibilityRole={hasLinks ? 'button' : 'menuitem'}
              accessibilityLabel={item.label}
              accessibilityState={{
                expanded: hasLinks ? openValue === item.value : undefined,
                selected: active,
              }}
              aria-haspopup={hasLinks ? 'menu' : undefined}
              testID={testID ? `${testID}-${item.value}` : undefined}
              style={{
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadii.md,
              }}
            >
              <Text
                variant="label"
                color={active ? 'navigationMenuTextActive' : 'navigationMenuTextDefault'}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Modal
        visible={openItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenValue(null)}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Close"
          onPress={() => setOpenValue(null)}
          testID={testID ? `${testID}-scrim` : undefined}
        />
        {openItem !== null && (
          <Box
            onLayout={onLayout}
            role="menu"
            accessibilityLabel={openItem.label}
            backgroundColor="navigationMenuBg"
            padding="sm"
            borderRadius="md"
            style={{
              position: 'absolute',
              top: (anchor ? anchor.y + anchor.height : 0) + theme.spacing.xs,
              left: anchor?.x ?? 0,
              minWidth: theme.spacing['2xl'] * 5,
              maxWidth: theme.spacing['2xl'] * 6,
            }}
          >
            <SketchBackground
              drawable={drawable}
              size={size}
              strokeColor={theme.colors.navigationMenuStroke}
              strokeWidth={theme.borderWidths.default}
              shadowColor={theme.colors.borderSubtle}
            />
            {openItem.links?.map((link) => (
              <Pressable
                key={link.value}
                onPress={() => selectLink(link)}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: link.value === value }}
                style={{
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borderRadii.sm,
                }}
              >
                <Text variant="label" color="navigationMenuTextDefault">
                  {link.label}
                </Text>
                {link.description !== undefined && (
                  <Text variant="caption" color="textSecondary">
                    {link.description}
                  </Text>
                )}
              </Pressable>
            ))}
          </Box>
        )}
      </Modal>
    </>
  );
}
