import { useTheme } from '@shopify/restyle';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** One command in a {@link Command} palette. */
export interface CommandItem {
  value: string;
  label: string;
  /** Optional group heading this command belongs to. */
  group?: string;
  /** Extra terms matched by the filter (not shown). */
  keywords?: string[];
  disabled?: boolean;
}

/** Props for {@link Command}. */
export interface CommandProps {
  /** Whether the palette is shown. */
  open: boolean;
  /** Called on scrim tap, hardware back, or after a selection. */
  onClose: () => void;
  /** The commands. */
  items: CommandItem[];
  /** Called with the chosen command value. */
  onSelect?: (value: string) => void;
  /** Search-field placeholder. Defaults to `'Type a command…'`. */
  placeholder?: string;
  /** Shown when the filter matches nothing. Defaults to `'No commands'`. */
  emptyText?: string;
  /** Test handle for queries. */
  testID?: string;
}

function matches(item: CommandItem, query: string): boolean {
  if (query === '') {
    return true;
  }
  const haystack = [item.label, item.group ?? '', ...(item.keywords ?? [])].join(' ').toLowerCase();
  return haystack.includes(query);
}

/**
 * A hand-drawn command palette: a searchable list of commands in a modal. Built
 * on React Native's `Modal` (the same overlay pattern as `Modal`) with a
 * `TextInput` filter and a scrollable, optionally grouped list. Colours and
 * sketch parameters come from `@ghds/tokens` (`comp.command.*`) via the Restyle
 * theme.
 */
export function Command({
  open,
  onClose,
  items,
  onSelect,
  placeholder = 'Type a command…',
  emptyText = 'No commands',
  testID,
}: CommandProps) {
  const theme = useTheme<Theme>();
  const [query, setQuery] = useState('');

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.commandSketch.roughness,
    bowing: theme.commandSketch.bowing,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => matches(item, q));
  }, [items, query]);

  // Group filtered commands, preserving first-seen group order.
  const groups = useMemo(() => {
    const order: string[] = [];
    const byGroup = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const key = item.group ?? '';
      if (!byGroup.has(key)) {
        byGroup.set(key, []);
        order.push(key);
      }
      byGroup.get(key)?.push(item);
    }
    return order.map((key) => ({ key, items: byGroup.get(key) ?? [] }));
  }, [filtered]);

  const handleSelect = (item: CommandItem) => {
    if (item.disabled) {
      return;
    }
    onSelect?.(item.value);
    setQuery('');
    onClose();
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      testID={testID}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        accessibilityLabel="Close"
        onPress={onClose}
        testID={testID ? `${testID}-scrim` : undefined}
      />
      <Box flex={1} justifyContent="flex-start" padding="lg" pointerEvents="box-none">
        <Box
          onLayout={onLayout}
          backgroundColor="commandBg"
          borderRadius="lg"
          padding="sm"
          style={{ maxHeight: '70%', marginTop: theme.spacing['2xl'] }}
        >
          <SketchBackground
            drawable={drawable}
            size={size}
            strokeColor={theme.colors.commandStroke}
            strokeWidth={theme.borderWidths.default}
            shadowColor={theme.colors.borderSubtle}
          />
          <Box
            flexDirection="row"
            alignItems="center"
            gap="sm"
            paddingHorizontal="md"
            paddingVertical="sm"
            marginBottom="sm"
            style={{
              borderBottomWidth: theme.borderWidths.default,
              borderColor: theme.colors.commandInputStroke,
            }}
          >
            <Icon name="search" size="sm" color={theme.colors.commandTextMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.commandTextMuted}
              autoFocus
              accessibilityLabel={placeholder}
              testID={testID ? `${testID}-search` : undefined}
              style={{
                flex: 1,
                padding: 0,
                color: theme.colors.commandTextDefault,
                fontFamily: theme.textVariants.body.fontFamily,
                fontSize: theme.textVariants.body.fontSize,
              }}
            />
          </Box>
          <ScrollView keyboardShouldPersistTaps="handled" accessibilityRole="menu">
            {filtered.length === 0 ? (
              <Box paddingVertical="md" paddingHorizontal="sm">
                <Text variant="body" color="commandTextMuted">
                  {emptyText}
                </Text>
              </Box>
            ) : (
              groups.map((group) => (
                <Box key={group.key || 'default'} marginBottom="xs">
                  {group.key !== '' && (
                    <Text
                      variant="caption"
                      color="commandTextMuted"
                      paddingHorizontal="sm"
                      paddingVertical="xs"
                    >
                      {group.key}
                    </Text>
                  )}
                  {group.items.map((item) => (
                    <Pressable
                      key={item.value}
                      onPress={() => handleSelect(item)}
                      disabled={item.disabled}
                      accessibilityRole="menuitem"
                      accessibilityState={{ disabled: item.disabled }}
                      style={{
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        borderRadius: theme.borderRadii.md,
                      }}
                    >
                      <Text
                        variant="body"
                        style={{
                          color: item.disabled
                            ? theme.colors.textDisabled
                            : theme.colors.commandTextDefault,
                        }}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </Box>
              ))
            )}
          </ScrollView>
        </Box>
      </Box>
    </Modal>
  );
}
