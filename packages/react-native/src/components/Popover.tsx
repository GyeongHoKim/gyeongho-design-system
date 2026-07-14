import { useTheme } from '@shopify/restyle';
import { type ReactNode, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, type View } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Props for {@link Popover}. */
export interface PopoverProps {
  /** The pressable trigger content. */
  trigger: ReactNode;
  /** Panel content shown when open. */
  children: ReactNode;
  /** Accessible label for the trigger. */
  triggerLabel: string;
  /** Controlled open state. */
  open?: boolean;
  /** Fires with the next open state. */
  onOpenChange?: (open: boolean) => void;
  /** Disables the trigger. */
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
 * A hand-drawn popover: a floating panel anchored beneath a trigger. React
 * Native has no DOM overlay, so the panel is presented in a `Modal` (the same
 * portal pattern used by `Menu`/`Select`) positioned with `measureInWindow`.
 * The sketchy panel and all colours come from `@ghds/tokens` (`comp.popover.*`)
 * via the Restyle theme.
 */
export function Popover({
  trigger,
  children,
  triggerLabel,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  testID,
}: PopoverProps) {
  const theme = useTheme<Theme>();
  const [internalOpen, setInternalOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const triggerRef = useRef<View>(null);

  const open = controlledOpen ?? internalOpen;

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.popoverSketch.roughness,
    bowing: theme.popoverSketch.bowing,
  });

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const handleOpen = () => {
    if (disabled) {
      return;
    }
    setOpen(true);
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={handleOpen}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={triggerLabel}
        accessibilityState={{ expanded: open, disabled }}
        aria-expanded={open}
        aria-haspopup="dialog"
        testID={testID}
        style={{ alignSelf: 'flex-start' }}
      >
        {trigger}
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Close popover"
          onPress={() => setOpen(false)}
          testID={testID ? `${testID}-scrim` : undefined}
        />
        {open && (
          <Box
            onLayout={onLayout}
            role="dialog"
            accessibilityLabel={triggerLabel}
            backgroundColor="popoverBg"
            paddingHorizontal="md"
            paddingVertical="sm"
            borderRadius="md"
            style={{
              position: 'absolute',
              top: (anchor ? anchor.y + anchor.height : 0) + theme.spacing.xs,
              left: anchor?.x ?? 0,
              minWidth: Math.max(anchor?.width ?? 0, theme.spacing['2xl'] * 4),
            }}
          >
            <SketchBackground
              drawable={drawable}
              size={size}
              strokeColor={theme.colors.popoverStroke}
              strokeWidth={theme.borderWidths.default}
              shadowColor={theme.colors.borderSubtle}
            />
            {children}
          </Box>
        )}
      </Modal>
    </>
  );
}
