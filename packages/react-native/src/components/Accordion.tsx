import { useTheme } from '@shopify/restyle';
import { type ReactNode, useId, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** One collapsible section. */
export interface AccordionItem {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

/** Props for {@link Accordion}. */
export interface AccordionProps {
  items: AccordionItem[];
  /** `'single'` keeps at most one open; `'multiple'` allows many. Defaults to `'single'`. */
  type?: 'single' | 'multiple';
  /** Controlled set of open values. */
  value?: string[];
  /** Initial open values when uncontrolled. */
  defaultValue?: string[];
  onValueChange?: (values: string[]) => void;
  /** Test handle for queries. */
  testID?: string;
}

interface AccordionItemViewProps {
  item: AccordionItem;
  open: boolean;
  onToggle: () => void;
}

function AccordionItemView({ item, open, onToggle }: AccordionItemViewProps) {
  const theme = useTheme<Theme>();
  const reactId = useId();
  const headerId = `${reactId}-header`;
  const regionId = `${reactId}-region`;
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.accordionSketch.roughness,
    bowing: theme.accordionSketch.bowing,
  });

  return (
    <Box onLayout={onLayout} backgroundColor="accordionBg" style={{ overflow: 'hidden' }}>
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={theme.colors.accordionStroke}
        strokeWidth={theme.borderWidths.default}
      />
      <Pressable
        onPress={item.disabled ? undefined : onToggle}
        disabled={item.disabled}
        nativeID={headerId}
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled: item.disabled }}
        aria-expanded={open}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: theme.spacing.md,
        }}
      >
        <Text variant="label" color={item.disabled ? 'textDisabled' : 'accordionTextHeader'}>
          {item.label}
        </Text>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon name="chevron-down" size="sm" color={theme.colors.accordionIcon} />
        </View>
      </Pressable>
      {open && (
        <Box
          paddingHorizontal="md"
          paddingBottom="md"
          nativeID={regionId}
          role="region"
          aria-labelledby={headerId}
        >
          {typeof item.content === 'string' ? (
            <Text variant="body" color="accordionTextContent">
              {item.content}
            </Text>
          ) : (
            item.content
          )}
        </Box>
      )}
    </Box>
  );
}

/**
 * A hand-drawn accordion (disclosure pattern). Each section is a sketchy box
 * (`@ghds/sketch-core`, rendered with `react-native-svg`) with a header
 * (`accessibilityState.expanded`) and collapsible content. `type="single"`
 * keeps at most one open; `"multiple"` allows many. Colours and sketch
 * parameters come from `@ghds/tokens` via the Restyle theme (`comp.accordion.*`).
 */
export function Accordion({
  items,
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  testID,
}: AccordionProps) {
  const theme = useTheme<Theme>();
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const open = value ?? internalValue;

  const setOpen = (next: string[]) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const toggle = (itemValue: string) => {
    const isOpen = open.includes(itemValue);
    if (type === 'single') {
      setOpen(isOpen ? [] : [itemValue]);
    } else {
      setOpen(isOpen ? open.filter((v) => v !== itemValue) : [...open, itemValue]);
    }
  };

  return (
    <Box testID={testID}>
      {items.map((item, index) => (
        <Box key={item.value} style={{ marginTop: index === 0 ? 0 : theme.accordionGap }}>
          <AccordionItemView
            item={item}
            open={open.includes(item.value)}
            onToggle={() => toggle(item.value)}
          />
        </Box>
      ))}
    </Box>
  );
}
