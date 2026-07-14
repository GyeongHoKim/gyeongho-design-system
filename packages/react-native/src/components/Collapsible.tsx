import { useTheme } from '@shopify/restyle';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, type LayoutChangeEvent, Pressable, View } from 'react-native';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** Props for {@link Collapsible}. */
export interface CollapsibleProps {
  /** Header (trigger) label. */
  label: string;
  /** Collapsible content. */
  children: ReactNode;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Fires with the next open state on toggle. */
  onOpenChange?: (open: boolean) => void;
  /** Disables the trigger. */
  disabled?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn collapsible (disclosure). The content region animates its height
 * open via `Animated`; the animation is skipped when the OS "reduce motion"
 * setting is on (checked through `AccessibilityInfo`, mirroring `motion.ts`).
 * Colours come from `@ghds/tokens` (`comp.collapsible.*`) via the Restyle theme.
 */
export function Collapsible({
  label,
  children,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  disabled = false,
  testID,
}: CollapsibleProps) {
  const theme = useTheme<Theme>();
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const open = controlledOpen ?? internalOpen;
  const openDuration = theme.animationDuration.normal;

  useEffect(() => {
    let cancelled = false;
    const target = open ? 1 : 0;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) {
        return;
      }
      if (reduce) {
        progress.setValue(target);
        return;
      }
      Animated.timing(progress, {
        toValue: target,
        duration: openDuration,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [open, progress, openDuration]);

  const toggle = () => {
    if (disabled) {
      return;
    }
    const next = !open;
    if (controlledOpen === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const onContentLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight((prev) => (prev === height ? prev : height));
  };

  const animatedHeight =
    contentHeight > 0
      ? progress.interpolate({ inputRange: [0, 1], outputRange: [0, contentHeight] })
      : undefined;

  return (
    <Box testID={testID}>
      <Pressable
        onPress={toggle}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open, disabled }}
        aria-expanded={open}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.sm,
        }}
      >
        <Text variant="label" color={disabled ? 'textDisabled' : 'collapsibleText'}>
          {label}
        </Text>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon name="chevron-down" size="sm" color={theme.colors.collapsibleStroke} />
        </View>
      </Pressable>
      {open && (
        <Animated.View style={{ overflow: 'hidden', opacity: progress, height: animatedHeight }}>
          <View onLayout={onContentLayout}>
            {typeof children === 'string' ? (
              <Text variant="body" color="collapsibleText" paddingBottom="sm">
                {children}
              </Text>
            ) : (
              children
            )}
          </View>
        </Animated.View>
      )}
    </Box>
  );
}
