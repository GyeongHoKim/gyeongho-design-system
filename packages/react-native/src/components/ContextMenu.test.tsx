import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { ContextMenu, type ContextMenuAction } from './ContextMenu.js';

const ACTIONS: ContextMenuAction[] = [
  { value: 'copy', label: 'Copy' },
  { value: 'delete', label: 'Delete', destructive: true },
];

describe('ContextMenu', () => {
  // The web build opens on right-click; touch has no right-click, so this opens
  // on long-press, which jsdom cannot dispatch. These tests cover the closed
  // trigger surface and its a11y wiring.
  it('renders the trigger closed', () => {
    renderWithTheme(
      <ContextMenu triggerLabel="Row" trigger={<Text>Row</Text>} items={ACTIONS} testID="cm">
        Row
      </ContextMenu>,
    );
    const trigger = screen.getByTestId('cm');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(screen.queryByText('Copy')).toBeNull();
  });

  it('renders in dark theme', () => {
    renderWithTheme(
      <ContextMenu triggerLabel="Row" trigger={<Text>Row</Text>} items={ACTIONS} testID="cm" />,
      darkTheme,
    );
    expect(screen.getByTestId('cm')).toBeInTheDocument();
  });
});
