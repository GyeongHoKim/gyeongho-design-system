import { useTheme } from '@shopify/restyle';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, type View } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Props for {@link Select}. */
export interface SelectProps {
  /** Visible, accessible label — required (there is no separate label element on RN). */
  label: string;
  /** The selectable options. Data-driven (like Web Components), not children composition. */
  options: SelectOption[];
  /** Controlled selected value. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Shown when nothing is selected. */
  placeholder?: string;
  /** Disables interaction. */
  disabled?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

const ESTIMATED_ROW_HEIGHT = 40;
const MAX_ESTIMATED_PANEL_HEIGHT = 320;

/**
 * Hand-drawn single-select dropdown. Unlike floating-ui-positioned React/Web
 * Components, there is no floating-ui binding for React Native — the panel is
 * a `Modal` (a real `createPortal`-to-body + full-viewport overlay on
 * react-native-web, confirmed via reading its source) with a single below/
 * above flip heuristic based on `View.measureInWindow()` and an *estimated*
 * (not measured-after-render) panel height — the same "good enough for v1,
 * don't over-engineer" scope already applied to `Textarea`'s `autoResize`.
 * `accessibilityRole="combobox"` on the trigger and `aria-expanded` (a
 * genuine first-class RN prop, verified directly against
 * `ViewAccessibility.d.ts`) are the only ARIA surface available — RN has no
 * `aria-haspopup`/`aria-controls`/`aria-activedescendant` in any form.
 */
export function Select({
  label,
  options,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  testID,
}: SelectProps) {
  const theme = useTheme<Theme>();
  const { height: windowHeight } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [anchor, setAnchor] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const triggerRef = useRef<View>(null);

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.selectSketch.roughness,
    bowing: theme.selectSketch.bowing,
  });

  const {
    onLayout: onPanelLayout,
    size: panelSize,
    drawable: panelDrawable,
  } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.selectSketch.roughness,
    bowing: theme.selectSketch.bowing,
    elevation: theme.selectSketch.elevation,
  });

  const selectedOption = options.find((option) => option.value === value);

  let strokeColor: string;
  if (disabled) {
    strokeColor = theme.colors.selectTriggerStrokeDisabled;
  } else if (focused) {
    strokeColor = theme.colors.selectTriggerStrokeFocus;
  } else {
    strokeColor = theme.colors.selectTriggerStrokeDefault;
  }

  const handleOpen = () => {
    if (disabled) {
      return;
    }
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ top: y, left: x, width, height });
      setOpen(true);
    });
  };

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) {
      return;
    }
    onValueChange?.(option.value);
    setOpen(false);
  };

  // Every option renders a row, including disabled ones — the estimate must
  // match `options.map(...)` below, not just the enabled subset.
  const estimatedPanelHeight = Math.min(
    options.length * ESTIMATED_ROW_HEIGHT,
    MAX_ESTIMATED_PANEL_HEIGHT,
  );
  const spaceBelow = windowHeight - (anchor.top + anchor.height);
  const openAbove = spaceBelow < estimatedPanelHeight && anchor.top > estimatedPanelHeight;
  const panelTop = openAbove
    ? anchor.top - estimatedPanelHeight - theme.spacing.xs
    : anchor.top + anchor.height + theme.spacing.xs;

  return (
    <Box>
      <Text variant="label" color="textSecondary" paddingBottom="xs">
        {label}
      </Text>
      <Pressable
        ref={triggerRef}
        onPress={handleOpen}
        onLayout={onLayout}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        testID={testID}
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityState={{ disabled, expanded: open }}
        // `accessibilityState.expanded` has no React Native Web equivalent
        // mapping (unlike `disabled`, which RNW derives `aria-disabled` from) —
        // `aria-expanded` must be set directly for the web target.
        aria-expanded={open}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          backgroundColor="bgSurface"
          borderRadius="sm"
          paddingHorizontal="md"
          paddingVertical="sm"
        >
          <SketchBackground
            drawable={drawable}
            size={size}
            strokeColor={strokeColor}
            strokeWidth={theme.borderWidths.default}
          />
          <Text
            style={{
              color: selectedOption
                ? disabled
                  ? theme.colors.selectTriggerTextDisabled
                  : theme.colors.selectTriggerTextValue
                : theme.colors.selectTriggerTextPlaceholder,
              fontFamily: theme.textVariants.body.fontFamily,
              fontSize: theme.textVariants.body.fontSize,
            }}
          >
            {selectedOption?.label ?? placeholder}
          </Text>
          <Icon name="chevron-down" size="sm" color={strokeColor} />
        </Box>
      </Pressable>
      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setOpen(false)}
          accessibilityRole="none"
        />
        <Box
          onLayout={onPanelLayout}
          style={{ position: 'absolute', top: panelTop, left: anchor.left, width: anchor.width }}
          backgroundColor="bgSurface"
          borderRadius="md"
          padding="xs"
          accessibilityRole="menu"
          accessibilityLabel={label}
        >
          <SketchBackground
            drawable={panelDrawable}
            size={panelSize}
            strokeColor={theme.colors.selectPanelStroke}
            strokeWidth={theme.borderWidths.default}
            shadowColor={theme.colors.borderSubtle}
          />
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option)}
                disabled={option.disabled}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isSelected, disabled: option.disabled }}
                aria-selected={isSelected}
                style={{
                  paddingVertical: theme.spacing.xs,
                  paddingHorizontal: theme.spacing.sm,
                  borderRadius: theme.borderRadii.sm,
                  backgroundColor: isSelected
                    ? theme.colors.selectOptionBgSelected
                    : theme.colors.transparent,
                }}
              >
                <Text
                  style={{
                    color: option.disabled
                      ? theme.colors.selectOptionTextDisabled
                      : isSelected
                        ? theme.colors.selectOptionTextSelected
                        : theme.colors.selectOptionTextDefault,
                    fontFamily: theme.textVariants.body.fontFamily,
                    fontSize: theme.textVariants.body.fontSize,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </Box>
      </Modal>
    </Box>
  );
}
