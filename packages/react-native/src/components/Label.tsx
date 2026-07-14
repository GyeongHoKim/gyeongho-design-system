import type { ReactNode } from 'react';
import { Box, Text } from '../theme/primitives.js';

/** Props for {@link Label}. */
export interface LabelProps {
  /** Label text. */
  children: ReactNode;
  /** The `nativeID` of the field this label describes (for `aria-labelledby`). */
  nativeID?: string;
  /** Applies the disabled token colour. */
  disabled?: boolean;
  /** Test handle for queries. */
  testID?: string;
}

/**
 * A form label. Renders `sys.typography.label` text in the `comp.label` colour;
 * pass `nativeID` and reference it from the field's `aria-labelledby` to
 * associate the two. All values come from `@ghds/tokens` via the Restyle theme.
 */
export function Label({ children, nativeID, disabled = false, testID }: LabelProps) {
  return (
    <Box testID={testID}>
      <Text
        variant="label"
        color={disabled ? 'labelTextDisabled' : 'labelText'}
        nativeID={nativeID}
      >
        {children}
      </Text>
    </Box>
  );
}
