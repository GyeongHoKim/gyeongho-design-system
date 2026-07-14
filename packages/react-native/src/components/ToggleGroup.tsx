import { useTheme } from '@shopify/restyle';
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';

/** Selection mode of a {@link ToggleGroup}. */
export type ToggleGroupType = 'single' | 'multiple';

interface ToggleGroupContextValue {
  readonly value: string[];
  readonly toggle: (itemValue: string) => void;
  readonly disabled: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

/** Props for {@link ToggleGroup}. */
export interface ToggleGroupProps {
  /** `'single'` keeps at most one selected; `'multiple'` allows many. Defaults to `'single'`. */
  type?: ToggleGroupType;
  /** Controlled set of selected values. */
  value?: string[];
  /** Initial selected values when uncontrolled. */
  defaultValue?: string[];
  /** Fires with the next selected values. */
  onValueChange?: (value: string[]) => void;
  /** Disables every item in the group. */
  disabled?: boolean;
  /** Direction to stack items. Defaults to `'row'`. */
  orientation?: 'row' | 'column';
  /** Accessible group name. */
  accessibilityLabel?: string;
  /** `ToggleGroupItem` children. */
  children: ReactNode;
  /** Test handle for queries. */
  testID?: string;
}

/** Props for {@link ToggleGroupItem}. */
export interface ToggleGroupItemProps {
  /** Value that identifies this item within the group. */
  value: string;
  /** Visible, accessible label. */
  label: string;
  /** Optional leading content (e.g. an icon). */
  children?: ReactNode;
  /** Disables just this item. */
  disabled?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn set of toggle buttons that share selection state via React
 * context (the same group pattern as `CheckboxGroup`/`RadioGroup`). `type`
 * chooses single- or multiple-selection. Colours, radius and sketch parameters
 * come from `@ghds/tokens` (`comp.toggle.*` + `comp.toggleGroup.*`).
 */
export function ToggleGroup({
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  orientation = 'row',
  accessibilityLabel,
  children,
  testID,
}: ToggleGroupProps) {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const selected = value ?? internalValue;

  const contextValue = useMemo<ToggleGroupContextValue>(() => {
    const setValue = (next: string[]) => {
      if (value === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    };
    return {
      value: selected,
      disabled,
      toggle: (itemValue: string) => {
        const isSelected = selected.includes(itemValue);
        if (type === 'single') {
          setValue(isSelected ? [] : [itemValue]);
        } else {
          setValue(isSelected ? selected.filter((v) => v !== itemValue) : [...selected, itemValue]);
        }
      },
    };
  }, [selected, disabled, type, value, onValueChange]);

  return (
    <Box
      flexDirection={orientation}
      gap="xs"
      alignSelf="flex-start"
      accessibilityRole={type === 'single' ? 'radiogroup' : 'toolbar'}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <ToggleGroupContext.Provider value={contextValue}>{children}</ToggleGroupContext.Provider>
    </Box>
  );
}

/** A single member of a {@link ToggleGroup}. Reads selection from context. */
export function ToggleGroupItem({
  value,
  label,
  children,
  disabled: itemDisabled = false,
  testID,
}: ToggleGroupItemProps) {
  const theme = useTheme<Theme>();
  const group = useContext(ToggleGroupContext);
  if (group === null) {
    throw new Error('ToggleGroupItem must be rendered inside a ToggleGroup.');
  }

  const disabled = itemDisabled || group.disabled;
  const isSelected = group.value.includes(value);

  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.toggleSketch.roughness,
    bowing: theme.toggleSketch.bowing,
    fillStyle: 'solid',
  });

  const backgroundHex = isSelected ? theme.colors.toggleBgPressed : theme.colors.toggleBgDefault;

  return (
    <Pressable
      onPress={disabled ? undefined : () => group.toggle(value)}
      onLayout={onLayout}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected, disabled }}
      aria-pressed={isSelected}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={isSelected ? theme.colors.toggleGroupStroke : theme.colors.toggleStroke}
        fillColor={backgroundHex}
        strokeWidth={theme.borderWidths.default}
      />
      <Box
        flexDirection="row"
        alignItems="center"
        gap="xs"
        paddingHorizontal="md"
        paddingVertical="sm"
        backgroundColor="transparent"
      >
        {children}
        <Text
          variant="label"
          color={disabled ? 'textDisabled' : isSelected ? 'toggleTextPressed' : 'toggleText'}
        >
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
