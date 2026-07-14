import { useTheme } from '@shopify/restyle';
import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, type View } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';
import type { SelectOption } from './Select.js';

/** Props for {@link Combobox}. */
export interface ComboboxProps {
  /** Visible, accessible label. */
  label: string;
  /** The selectable options. */
  options: SelectOption[];
  /** Controlled selected value. */
  value?: string;
  /** Fires with the chosen option value. */
  onValueChange?: (value: string) => void;
  /** Shown on the trigger when nothing is selected. */
  placeholder?: string;
  /** Placeholder for the search field. Defaults to `'Search…'`. */
  searchPlaceholder?: string;
  /** Shown when the filter matches no options. Defaults to `'No results'`. */
  emptyText?: string;
  /** Disables interaction. */
  disabled?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn combobox: a searchable single-select. Tapping the trigger opens a
 * `Modal` panel (the same portal pattern as `Select`) with a `TextInput` filter
 * and the matching options. It reuses `Select`'s `SelectOption` shape and panel
 * treatment; the addition over `Select` is the case-insensitive label filter.
 * Colours and sketch parameters come from `@ghds/tokens` (`comp.combobox.*`).
 */
export function Combobox({
  label,
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder = 'Search…',
  emptyText = 'No results',
  disabled = false,
  testID,
}: ComboboxProps) {
  const theme = useTheme<Theme>();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const triggerRef = useRef<View>(null);

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.comboboxSketch.roughness,
    bowing: theme.comboboxSketch.bowing,
  });
  const {
    onLayout: onPanelLayout,
    size: panelSize,
    drawable: panelDrawable,
  } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.comboboxSketch.roughness,
    bowing: theme.comboboxSketch.bowing,
  });

  const selectedOption = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === '') {
      return options;
    }
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query]);

  const handleOpen = () => {
    if (disabled) {
      return;
    }
    setQuery('');
    setOpen(true);
  };

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) {
      return;
    }
    onValueChange?.(option.value);
    setOpen(false);
  };

  const strokeColor =
    focused && !disabled ? theme.colors.comboboxStrokeFocus : theme.colors.comboboxStrokeDefault;

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
        testID={testID}
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityState={{ disabled, expanded: open }}
        aria-expanded={open}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          borderRadius="md"
          paddingHorizontal="md"
          paddingVertical="sm"
          backgroundColor="comboboxBg"
        >
          <SketchBackground
            drawable={drawable}
            size={size}
            strokeColor={theme.colors.comboboxStrokeDefault}
            strokeWidth={theme.borderWidths.default}
          />
          <Text
            style={{
              color: selectedOption
                ? theme.colors.comboboxText
                : theme.colors.selectTriggerTextPlaceholder,
              fontFamily: theme.textVariants.body.fontFamily,
              fontSize: theme.textVariants.body.fontSize,
            }}
          >
            {selectedOption?.label ?? placeholder}
          </Text>
          <Icon name="chevron-down" size="sm" color={theme.colors.comboboxStrokeDefault} />
        </Box>
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setOpen(false)}
          accessibilityLabel="Close"
          testID={testID ? `${testID}-scrim` : undefined}
        />
        <Box flex={1} justifyContent="center" padding="lg" pointerEvents="box-none">
          <Box
            onLayout={onPanelLayout}
            backgroundColor="comboboxListboxBg"
            borderRadius="md"
            padding="sm"
            style={{ maxHeight: 360 }}
          >
            <SketchBackground
              drawable={panelDrawable}
              size={panelSize}
              strokeColor={strokeColor}
              strokeWidth={theme.borderWidths.default}
              shadowColor={theme.colors.borderSubtle}
            />
            <Box
              borderRadius="md"
              paddingHorizontal="md"
              paddingVertical="sm"
              marginBottom="sm"
              flexDirection="row"
              alignItems="center"
              gap="sm"
              style={{ borderWidth: theme.borderWidths.default, borderColor: strokeColor }}
            >
              <Icon name="search" size="sm" color={theme.colors.comboboxStrokeDefault} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={theme.colors.selectTriggerTextPlaceholder}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoFocus
                accessibilityLabel={searchPlaceholder}
                testID={testID ? `${testID}-search` : undefined}
                style={{
                  flex: 1,
                  padding: 0,
                  color: theme.colors.comboboxText,
                  fontFamily: theme.textVariants.body.fontFamily,
                  fontSize: theme.textVariants.body.fontSize,
                }}
              />
            </Box>
            <ScrollView keyboardShouldPersistTaps="handled" accessibilityRole="menu">
              {filtered.length === 0 ? (
                <Box paddingVertical="sm" paddingHorizontal="sm">
                  <Text variant="body" color="textSecondary">
                    {emptyText}
                  </Text>
                </Box>
              ) : (
                filtered.map((option) => {
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
                        paddingVertical: theme.spacing.sm,
                        paddingHorizontal: theme.spacing.md,
                        borderRadius: theme.borderRadii.sm,
                        backgroundColor: isSelected
                          ? theme.colors.comboboxOptionSelected
                          : theme.colors.transparent,
                      }}
                    >
                      <Text
                        style={{
                          color: option.disabled
                            ? theme.colors.selectOptionTextDisabled
                            : theme.colors.comboboxText,
                          fontFamily: theme.textVariants.body.fontFamily,
                          fontSize: theme.textVariants.body.fontSize,
                        }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
