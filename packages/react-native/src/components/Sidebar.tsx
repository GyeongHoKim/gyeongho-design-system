import type { IconName } from '@ghds/icons';
import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** One navigable item in a {@link Sidebar} section. */
export interface SidebarItem {
  value: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
}

/** A titled group of items in a {@link Sidebar}. */
export interface SidebarSection {
  /** Optional section heading. */
  title?: string;
  items: SidebarItem[];
}

/** Props for {@link Sidebar}. */
export interface SidebarProps {
  /** The grouped navigation items. */
  sections: SidebarSection[];
  /** Currently active item value. */
  activeValue?: string;
  /** Called with the tapped item value. */
  onSelect?: (value: string) => void;
  /** Optional header content (e.g. a logo). */
  header?: ReactNode;
  /** Optional footer content (e.g. a user chip). */
  footer?: ReactNode;
  /**
   * Panel width in px. Defaults to {@link DEFAULT_WIDTH}. The `comp.sidebar.width`
   * token currently aliases `sys.breakpoint.mobile`, which resolves to `0`, so a
   * geometry fallback is used here until that alias is retargeted in the tokens
   * package. Pass `'stretch'` to fill the parent instead (e.g. inside a Drawer).
   */
  width?: number | 'stretch';
  /** Accessible label for the navigation. */
  accessibilityLabel?: string;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * Default sidebar width (geometry, px). Used because `comp.sidebar.width`
 * resolves to `0` (see {@link SidebarProps.width}).
 */
const DEFAULT_WIDTH = 280;

/**
 * A hand-drawn sidebar navigation. A vertical, scrollable panel of titled
 * sections with active-item highlighting — the drawer-style nav used for app
 * shells (pair it with `Drawer`/`Sheet` on narrow screens). Colours come from
 * `@ghds/tokens` (`comp.sidebar.*`) via the Restyle theme.
 */
export function Sidebar({
  sections,
  activeValue,
  onSelect,
  header,
  footer,
  width = DEFAULT_WIDTH,
  accessibilityLabel,
  testID,
}: SidebarProps) {
  const theme = useTheme<Theme>();

  return (
    <Box
      backgroundColor="sidebarBg"
      padding="md"
      accessibilityRole="menu"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={{
        alignSelf: 'stretch',
        width: width === 'stretch' ? undefined : width,
        borderRightWidth: theme.borderWidths.default,
        borderColor: theme.colors.sidebarStroke,
      }}
    >
      {header !== undefined && <Box marginBottom="md">{header}</Box>}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 1 }}>
        {sections.map((section, sectionIndex) => (
          <Box key={section.title ?? `section-${sectionIndex}`} marginBottom="md">
            {section.title !== undefined && (
              <Text
                variant="caption"
                color="textSecondary"
                paddingBottom="xs"
                paddingHorizontal="sm"
              >
                {section.title}
              </Text>
            )}
            {section.items.map((item) => {
              const active = item.value === activeValue;
              return (
                <Pressable
                  key={item.value}
                  onPress={item.disabled ? undefined : () => onSelect?.(item.value)}
                  disabled={item.disabled}
                  accessibilityRole="menuitem"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: active, disabled: item.disabled }}
                  aria-selected={active}
                  testID={testID ? `${testID}-${item.value}` : undefined}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.sm,
                    borderRadius: theme.borderRadii.md,
                    backgroundColor: active
                      ? theme.colors.sidebarItemActive
                      : theme.colors.transparent,
                  }}
                >
                  {item.icon !== undefined && (
                    <Icon
                      name={item.icon}
                      size="sm"
                      color={
                        item.disabled
                          ? theme.colors.textDisabled
                          : active
                            ? theme.colors.sidebarItemActiveText
                            : theme.colors.sidebarText
                      }
                    />
                  )}
                  <Text
                    variant="label"
                    style={{
                      color: item.disabled
                        ? theme.colors.textDisabled
                        : active
                          ? theme.colors.sidebarItemActiveText
                          : theme.colors.sidebarText,
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </Box>
        ))}
      </ScrollView>
      {footer !== undefined && <Box marginTop="md">{footer}</Box>}
    </Box>
  );
}
