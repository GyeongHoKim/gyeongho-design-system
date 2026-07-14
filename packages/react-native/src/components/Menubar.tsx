import { useTheme } from '@shopify/restyle';
import { ScrollView } from 'react-native';
import { Box } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Menu, type MenuItem } from './Menu.js';

/** One top-level menu in a {@link Menubar}. */
export interface MenubarMenu {
  value: string;
  label: string;
  items: MenuItem[];
}

/** Props for {@link Menubar}. */
export interface MenubarProps {
  /** The top-level menus. */
  menus: MenubarMenu[];
  /** Called with the menu value and the activated item value. */
  onSelect?: (menuValue: string, itemValue: string) => void;
  /** Accessible label for the bar. */
  accessibilityLabel?: string;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn menubar. On the desktop web build the menus align in a fixed
 * horizontal bar; on a narrow touch screen that bar is a **horizontally
 * scrollable** strip of `Menu` triggers, each opening its own dropdown (reusing
 * the `Menu` component and its `Modal` panel). Colours come from `@ghds/tokens`
 * (`comp.menubar.*` + `comp.menu.*`).
 */
export function Menubar({ menus, onSelect, accessibilityLabel, testID }: MenubarProps) {
  const theme = useTheme<Theme>();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="menubar"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      contentContainerStyle={{ gap: theme.spacing.xs, padding: theme.spacing.xs }}
    >
      {menus.map((menu) => (
        <Box key={menu.value}>
          <Menu
            label={menu.label}
            items={menu.items}
            onSelect={(itemValue) => onSelect?.(menu.value, itemValue)}
            testID={testID ? `${testID}-${menu.value}` : undefined}
          />
        </Box>
      ))}
    </ScrollView>
  );
}
