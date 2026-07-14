import type { IconName } from '@ghds/icons';
import { useTheme } from '@shopify/restyle';
import type { ReactNode } from 'react';
import { Box, Text } from '../theme/primitives.js';
import type { Theme } from '../theme/theme.js';
import { Icon } from './Icon.js';

/** Props for {@link Empty}. */
export interface EmptyProps {
  /** Optional illustrative icon shown above the title. */
  icon?: IconName;
  /** Headline describing the empty state. */
  title: string;
  /** Optional supporting copy. */
  description?: string;
  /** Optional action(s), e.g. a `Button`. */
  children?: ReactNode;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A hand-drawn empty state. Centres an optional icon, a title, optional
 * description and optional action content. All colours, gaps and padding come
 * from `@ghds/tokens` (`comp.empty.*`) via the Restyle theme.
 */
export function Empty({ icon, title, description, children, testID }: EmptyProps) {
  const theme = useTheme<Theme>();
  return (
    <Box
      alignItems="center"
      justifyContent="center"
      padding="xl"
      gap="md"
      testID={testID}
      accessibilityRole="summary"
      accessibilityLabel={title}
    >
      {icon !== undefined && <Icon name={icon} size="lg" color={theme.colors.emptyIcon} />}
      <Text variant="title" color="emptyText" textAlign="center">
        {title}
      </Text>
      {description !== undefined && (
        <Text variant="body" color="emptyTextMuted" textAlign="center">
          {description}
        </Text>
      )}
      {children}
    </Box>
  );
}
