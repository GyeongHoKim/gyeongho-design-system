import { useTheme } from '@shopify/restyle';
import { type ReactNode, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, type View } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** One context-menu action. */
export interface ContextMenuAction {
  value: string;
  label: string;
  disabled?: boolean;
  /** Renders the item in the danger colour. */
  destructive?: boolean;
}

/** Props for {@link ContextMenu}. */
export interface ContextMenuProps {
  /** The element the menu is attached to. */
  trigger: ReactNode;
  /** Accessible label describing what the menu acts on. */
  triggerLabel: string;
  /** The actions. */
  items: ContextMenuAction[];
  /** Called with the activated action's value. */
  onSelect?: (value: string) => void;
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
 * A hand-drawn context menu. On the web this opens on right-click; there is no
 * right-click on touch, so this adaptation opens on **long-press** and presents
 * the actions as a floating list anchored to the trigger (via the `Modal`
 * portal pattern, like `Menu`). Colours come from `@ghds/tokens`
 * (`comp.contextMenu.*`) via the Restyle theme.
 */
export function ContextMenu({ trigger, triggerLabel, items, onSelect, testID }: ContextMenuProps) {
  const theme = useTheme<Theme>();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const triggerRef = useRef<View>(null);

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.contextMenuSketch.roughness,
    bowing: theme.contextMenuSketch.bowing,
  });

  const openMenu = () => {
    setOpen(true);
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  };

  const select = (item: ContextMenuAction) => {
    if (item.disabled) {
      return;
    }
    onSelect?.(item.value);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        onLongPress={openMenu}
        delayLongPress={300}
        accessibilityRole="button"
        accessibilityLabel={triggerLabel}
        accessibilityHint="Long-press for actions"
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
        aria-haspopup="menu"
        testID={testID}
        style={{ alignSelf: 'flex-start' }}
      >
        {trigger}
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Close menu"
          onPress={() => setOpen(false)}
          testID={testID ? `${testID}-scrim` : undefined}
        />
        {open && (
          <Box
            onLayout={onLayout}
            role="menu"
            accessibilityLabel={triggerLabel}
            backgroundColor="contextMenuBg"
            padding="xs"
            borderRadius="md"
            style={{
              position: 'absolute',
              top: (anchor ? anchor.y + anchor.height : 0) + theme.spacing.xs,
              left: anchor?.x ?? 0,
              minWidth: theme.spacing['2xl'] * 4,
            }}
          >
            <SketchBackground
              drawable={drawable}
              size={size}
              strokeColor={theme.colors.contextMenuStroke}
              strokeWidth={theme.borderWidths.default}
              shadowColor={theme.colors.borderSubtle}
            />
            {items.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => select(item)}
                disabled={item.disabled}
                accessibilityRole="menuitem"
                accessibilityState={{ disabled: item.disabled }}
                style={{
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borderRadii.sm,
                }}
              >
                <Text
                  variant="body"
                  style={{
                    color: item.disabled
                      ? theme.colors.textDisabled
                      : item.destructive
                        ? theme.colors.contextMenuItemDanger
                        : theme.colors.contextMenuText,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </Box>
        )}
      </Modal>
    </>
  );
}
