import { useTheme } from '@shopify/restyle';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** One entry in a {@link Breadcrumb} trail. */
export interface BreadcrumbItem {
  /** Visible label. */
  label: string;
  /** Link target (web parity). On React Native, use `onSelect` to navigate. */
  href?: string;
}

/** Props for {@link Breadcrumb}. */
export interface BreadcrumbProps {
  /** Trail from root → current. The last item is the current page. */
  items: BreadcrumbItem[];
  /** Accessible name for the nav landmark. Defaults to `'Breadcrumb'`. */
  label?: string;
  /** Fired when a non-current item is pressed. */
  onSelect?: (item: BreadcrumbItem, index: number) => void;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A breadcrumb navigation trail. Renders a horizontal row of links separated by
 * hand-drawn chevrons; the last item is the current page. Colours and typography
 * come from `@ghds/tokens` via the Restyle theme (`comp.breadcrumb.*`). React
 * Native has no `href`, so navigation is delegated to the `onSelect` callback.
 */
export function Breadcrumb({ items, label = 'Breadcrumb', onSelect, testID }: BreadcrumbProps) {
  const theme = useTheme<Theme>();
  const last = items.length - 1;

  return (
    <Box
      flexDirection="row"
      flexWrap="wrap"
      alignItems="center"
      role="navigation"
      accessibilityLabel={label}
      testID={testID}
    >
      {items.map((item, index) => {
        const isLast = index === last;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: breadcrumb items are a positional, ordered trail
          <Box key={index} flexDirection="row" alignItems="center">
            {isLast ? (
              // Current page: emphasised (label weight) + marked selected, matching
              // the aria-current="page" the web platforms set.
              <Text
                variant="body"
                color="breadcrumbTextCurrent"
                fontWeight={theme.textVariants.label.fontWeight}
                accessibilityRole="text"
                accessibilityState={{ selected: true }}
              >
                {item.label}
              </Text>
            ) : item.href === undefined ? (
              <Text variant="body" color="breadcrumbTextCurrent" accessibilityRole="text">
                {item.label}
              </Text>
            ) : (
              <Text
                variant="body"
                color="breadcrumbTextLink"
                accessibilityRole="link"
                onPress={() => onSelect?.(item, index)}
              >
                {item.label}
              </Text>
            )}
            {!isLast && (
              <Box paddingHorizontal="xs">
                <Icon name="chevron-right" size="sm" color={theme.colors.breadcrumbSeparator} />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
