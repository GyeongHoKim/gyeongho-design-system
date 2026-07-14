import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { Box } from '../theme/primitives.js';

/** Props for {@link ButtonGroup}. */
export interface ButtonGroupProps {
  /** The buttons (or toggles) to group. */
  children: ReactNode;
  /** Direction to stack the members. Defaults to `'row'`. */
  orientation?: 'row' | 'column';
  /** Accessible group name. */
  accessibilityLabel?: string;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A layout wrapper that visually and semantically groups related buttons. It is
 * a pure layout + accessible-group container (exposed with
 * `accessibilityRole="toolbar"`); spacing comes from `@ghds/tokens`
 * (`comp.buttonGroup.gap`, which resolves to `sys.spacing.none`, so members sit
 * flush) via the Restyle theme.
 */
export function ButtonGroup({
  children,
  orientation = 'row',
  accessibilityLabel,
  testID,
}: ButtonGroupProps) {
  const style: ViewStyle = {
    flexDirection: orientation === 'row' ? 'row' : 'column',
    alignItems: orientation === 'row' ? 'center' : 'stretch',
  };

  return (
    <Box
      style={style}
      gap="none"
      alignSelf="flex-start"
      accessibilityRole="toolbar"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </Box>
  );
}
