import { useTheme } from '@shopify/restyle';
import { Pressable, View } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** A column definition. */
export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
}

/** A row: a stable `id` plus a cell value per column key. */
export interface TableRow {
  id: string;
  [key: string]: string | number;
}

export type SortDirection = 'asc' | 'desc';
export interface TableSort {
  key: string;
  direction: SortDirection;
}

/** Props for {@link Table}. */
export interface TableProps {
  columns: TableColumn[];
  rows: TableRow[];
  caption?: string;
  sort?: TableSort;
  onSortChange?: (sort: TableSort) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  testID?: string;
}

const ALIGN: Record<NonNullable<TableColumn['align']>, 'flex-start' | 'flex-end' | 'center'> = {
  left: 'flex-start',
  right: 'flex-end',
  center: 'center',
};

/**
 * A compact selection control for a table cell — a sketch-less bordered box with
 * a check (selected), a dash (indeterminate / partial select-all), or nothing
 * (unselected). Not the standalone Checkbox because that requires a visible
 * label, which would clutter every selection cell. Module-scoped so it is a
 * stable component type across Table re-renders.
 */
function SelectBox({
  checked,
  indeterminate = false,
  label,
  onPress,
}: {
  checked: boolean;
  indeterminate?: boolean;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme<Theme>();
  const box = theme.iconSizes.md;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? 'mixed' : checked }}
      accessibilityLabel={label}
      style={{ paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md }}
    >
      <View
        style={{
          width: box,
          height: box,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: theme.borderWidths.default,
          borderColor: theme.colors.tableStroke,
        }}
      >
        {checked ? (
          <Icon name="check" size="sm" color={theme.colors.tableIcon} />
        ) : indeterminate ? (
          <Icon name="minus" size="sm" color={theme.colors.tableIcon} />
        ) : null}
      </View>
    </Pressable>
  );
}

/**
 * A hand-drawn data table. A sketchy outline (`@ghds/sketch-core`) frames rows
 * built from flex `Box`es (React Native has no `<table>`), with sortable headers
 * and optional row selection. Controlled: emits `onSortChange` /
 * `onSelectionChange` and renders `rows` as given. Sort is exposed on web via
 * `role="columnheader"`; arrow/`aria-sort` is a documented web gap. Colours and
 * sketch parameters come from `@ghds/tokens` via the Restyle theme
 * (`comp.table.*`).
 */
export function Table({
  columns,
  rows,
  caption,
  sort,
  onSortChange,
  selectedIds,
  onSelectionChange,
  testID,
}: TableProps) {
  const theme = useTheme<Theme>();
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.tableSketch.roughness,
    bowing: theme.tableSketch.bowing,
  });

  const selectable = selectedIds !== undefined && onSelectionChange !== undefined;
  const selected = new Set(selectedIds ?? []);
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = rows.some((r) => selected.has(r.id));

  const handleSort = (key: string) => {
    const direction: SortDirection = sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange?.({ key, direction });
  };
  const toggleRow = (id: string) => {
    onSelectionChange?.(
      selected.has(id) ? [...selected].filter((x) => x !== id) : [...selected, id],
    );
  };

  const cellPad = {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  } as const;

  return (
    <Box
      onLayout={onLayout}
      backgroundColor="tableBg"
      role="table"
      accessibilityLabel={caption}
      testID={testID}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={theme.colors.tableStroke}
        strokeWidth={theme.borderWidths.default}
      />
      {caption && (
        <Text variant="label" color="tableTextHeader" style={cellPad}>
          {caption}
        </Text>
      )}
      {/* Header row */}
      <Box
        flexDirection="row"
        role="row"
        backgroundColor="tableHeaderBg"
        style={{
          borderBottomWidth: theme.borderWidths.default,
          borderColor: theme.colors.tableRowBorder,
        }}
      >
        {selectable && (
          <SelectBox
            checked={allSelected}
            indeterminate={!allSelected && someSelected}
            label="Select all rows"
            onPress={() => onSelectionChange?.(allSelected ? [] : rows.map((r) => r.id))}
          />
        )}
        {columns.map((col) => {
          const active = sort?.key === col.key;
          const content = (
            <Box flexDirection="row" alignItems="center" style={{ gap: theme.spacing.xs }}>
              <Text variant="label" color="tableTextHeader">
                {col.header}
              </Text>
              {active && (
                <Icon
                  name={sort?.direction === 'asc' ? 'chevron-up' : 'chevron-down'}
                  size="sm"
                  color={theme.colors.tableIcon}
                />
              )}
            </Box>
          );
          return (
            <Box
              key={col.key}
              flex={1}
              role="columnheader"
              style={{ ...cellPad, alignItems: ALIGN[col.align ?? 'left'] }}
            >
              {col.sortable ? (
                <Pressable onPress={() => handleSort(col.key)} accessibilityRole="button">
                  {content}
                </Pressable>
              ) : (
                content
              )}
            </Box>
          );
        })}
      </Box>
      {/* Body rows */}
      {rows.map((row) => {
        const isSelected = selected.has(row.id);
        return (
          <Box
            key={row.id}
            flexDirection="row"
            role="row"
            backgroundColor={isSelected ? 'tableSelectedBg' : undefined}
            style={{
              borderBottomWidth: theme.borderWidths.default,
              borderColor: theme.colors.tableRowBorder,
            }}
          >
            {selectable && (
              <SelectBox
                checked={isSelected}
                label={`Select row ${row.id}`}
                onPress={() => toggleRow(row.id)}
              />
            )}
            {columns.map((col) => (
              <Box
                key={col.key}
                flex={1}
                role="cell"
                style={{ ...cellPad, alignItems: ALIGN[col.align ?? 'left'] }}
              >
                <Text variant="body" color="tableTextCell">
                  {String(row[col.key])}
                </Text>
              </Box>
            ))}
          </Box>
        );
      })}
    </Box>
  );
}
