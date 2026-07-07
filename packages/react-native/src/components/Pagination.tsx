import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { SketchBackground } from '../sketch/SketchBackground.js';
import { useSketch } from '../sketch/useSketch.js';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** Props for {@link Pagination}. */
export interface PaginationProps {
  /** Total number of pages. */
  count: number;
  /** Current page (1-based). */
  page: number;
  /** Called with the next page when a control is pressed. */
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current page. Defaults to `1`. */
  siblingCount?: number;
  /** Accessible name for the nav landmark. Defaults to `'Pagination'`. */
  label?: string;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * Build the list of pages to show, collapsing large gaps to a single ellipsis.
 * See the React implementation for the full contract; the logic is identical.
 */
export function paginationRange(
  count: number,
  page: number,
  siblingCount = 1,
): (number | 'ellipsis')[] {
  if (count < 1) {
    return [];
  }
  const threshold = 2 * siblingCount + 5;
  if (count <= threshold) {
    return Array.from({ length: count }, (_, i) => i + 1);
  }
  const clamped = Math.min(Math.max(page, 1), count);
  const pages = new Set<number>([1, count]);
  for (let p = clamped - siblingCount; p <= clamped + siblingCount; p++) {
    if (p >= 1 && p <= count) {
      pages.add(p);
    }
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev === 2) {
      result.push(prev + 1);
    } else if (p - prev > 2) {
      result.push('ellipsis');
    }
    result.push(p);
    prev = p;
  }
  return result;
}

type ColorKey = keyof Theme['colors'];

interface PaginationItemProps {
  selected?: boolean;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  children: ReactNode;
  testID?: string;
}

function PaginationItem({
  selected = false,
  disabled = false,
  label,
  onPress,
  children,
  testID,
}: PaginationItemProps) {
  const theme = useTheme<Theme>();
  const { onLayout, size, drawable } = useSketch({
    inset: theme.borderWidths.default,
    roughness: theme.paginationSketch.roughness,
    bowing: theme.paginationSketch.bowing,
  });

  const bgKey: ColorKey = disabled
    ? 'paginationItemBgDisabled'
    : selected
      ? 'paginationItemBgSelected'
      : 'paginationItemBgDefault';
  const strokeKey: ColorKey = disabled
    ? 'paginationItemStrokeDisabled'
    : selected
      ? 'paginationItemStrokeSelected'
      : 'paginationItemStrokeDefault';
  const textKey: ColorKey = disabled
    ? 'paginationItemTextDisabled'
    : selected
      ? 'paginationItemTextSelected'
      : 'paginationItemTextDefault';
  const dimension = theme.paginationSize;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onLayout={onLayout}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      testID={testID}
      style={{
        minWidth: dimension,
        height: dimension,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.xs,
        backgroundColor: theme.colors[bgKey],
      }}
    >
      <SketchBackground
        drawable={drawable}
        size={size}
        strokeColor={theme.colors[strokeKey]}
        strokeWidth={theme.borderWidths.default}
      />
      {typeof children === 'string' ? (
        <Text variant="body" color={textKey}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

/**
 * A hand-drawn pager. Renders Previous/Next controls around a list of sketchy
 * page buttons, collapsing large ranges with an ellipsis. The current page is
 * filled and exposed via `accessibilityState.selected`. Colours, size, and
 * sketch parameters come from `@ghds/tokens` via the Restyle theme
 * (`comp.pagination.*`).
 */
export function Pagination({
  count,
  page,
  onPageChange,
  siblingCount = 1,
  label = 'Pagination',
  testID,
}: PaginationProps) {
  const theme = useTheme<Theme>();
  const items = paginationRange(count, page, siblingCount);
  const go = (next: number) => {
    if (next >= 1 && next <= count && next !== page) {
      onPageChange?.(next);
    }
  };

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      role="navigation"
      accessibilityLabel={label}
      testID={testID}
    >
      <Box paddingRight="xs">
        <PaginationItem label="Previous page" disabled={page <= 1} onPress={() => go(page - 1)}>
          <Icon
            name="chevron-left"
            size="sm"
            color={
              page <= 1
                ? theme.colors.paginationItemTextDisabled
                : theme.colors.paginationItemTextDefault
            }
          />
        </PaginationItem>
      </Box>
      {items.map((item, index) =>
        item === 'ellipsis' ? (
          <Box
            // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis positions are stable within a render
            key={`ellipsis-${index}`}
            paddingRight="xs"
            aria-hidden={true}
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
          >
            <Text variant="body" color="paginationItemTextDefault">
              …
            </Text>
          </Box>
        ) : (
          <Box key={item} paddingRight="xs">
            <PaginationItem
              label={`Page ${item}`}
              selected={item === page}
              onPress={() => go(item)}
            >
              {String(item)}
            </PaginationItem>
          </Box>
        ),
      )}
      <PaginationItem label="Next page" disabled={page >= count} onPress={() => go(page + 1)}>
        <Icon
          name="chevron-right"
          size="sm"
          color={
            page >= count
              ? theme.colors.paginationItemTextDisabled
              : theme.colors.paginationItemTextDefault
          }
        />
      </PaginationItem>
    </Box>
  );
}
