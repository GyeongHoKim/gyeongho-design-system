import { useTheme } from '@shopify/restyle';
import { useRef, useState } from 'react';
import { Modal, Pressable, type View } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** One menu entry. */
export interface MenuItem {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Props for {@link Menu}. */
export interface MenuProps {
  /** Trigger button label. */
  label: string;
  /** Menu entries. */
  items: MenuItem[];
  /** Called with the value of the activated item. */
  onSelect?: (value: string) => void;
  /** Disables the whole menu. */
  disabled?: boolean;
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
 * A hand-drawn menu (dropdown). A trigger button opens a `Modal` panel of items
 * anchored beneath it (position measured with `measureInWindow`). Selection is
 * by tap; the current-page/keyboard roving model of the web builds is not wired
 * on React Native. Colours and sketch parameters come from `@ghds/tokens` via
 * the Restyle theme (`comp.menu.*`).
 */
export function Menu({ label, items, onSelect, disabled = false, testID }: MenuProps) {
  const theme = useTheme<Theme>();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const triggerRef = useRef<View>(null);

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.menuSketch.roughness,
    bowing: theme.menuSketch.bowing,
  });

  const openMenu = () => {
    // Open immediately; refine the anchor position once measured (async on some
    // platforms), so the panel is never gated on the measure callback firing.
    setOpen(true);
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  };

  const select = (item: MenuItem) => {
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
        onPress={disabled ? undefined : openMenu}
        onLayout={onLayout}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open, disabled }}
        aria-haspopup="menu"
        aria-expanded={open}
        testID={testID}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          alignSelf: 'flex-start',
          backgroundColor: theme.colors.menuTriggerBg,
        }}
      >
        <SketchBackground
          drawable={drawable}
          size={size}
          strokeColor={theme.colors.menuTriggerStroke}
          strokeWidth={theme.borderWidths.default}
        />
        <Text variant="label" color="menuTriggerText">
          {label}
        </Text>
      </Pressable>
      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1 }}
          accessibilityLabel="Close menu"
          onPress={() => setOpen(false)}
        >
          {open && (
            <Box
              role="menu"
              accessibilityLabel={label}
              backgroundColor="menuPanelBg"
              padding="xs"
              style={{
                position: 'absolute',
                top: (anchor ? anchor.y + anchor.height : 0) + theme.spacing.xs,
                left: anchor?.x ?? 0,
                minWidth: Math.max(anchor?.width ?? 160, 160),
                borderWidth: theme.borderWidths.default,
                borderColor: theme.colors.menuPanelStroke,
                borderRadius: theme.borderRadii.md,
              }}
            >
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
                    color={item.disabled ? 'menuItemTextDisabled' : 'menuItemTextDefault'}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </Box>
          )}
        </Pressable>
      </Modal>
    </>
  );
}
