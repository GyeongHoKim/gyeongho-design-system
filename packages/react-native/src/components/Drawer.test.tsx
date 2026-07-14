import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { Drawer } from './Drawer.js';

describe('Drawer', () => {
  it('renders the title and content when open', () => {
    renderWithTheme(
      <Drawer open onClose={() => {}} title="Menu">
        <Text>Body</Text>
      </Drawer>,
    );
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('closes from the scrim', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Drawer open onClose={onClose} title="Menu" testID="drawer">
        <Text>Body</Text>
      </Drawer>,
    );
    fireEvent.click(screen.getByTestId('drawer-scrim'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders in dark theme', () => {
    renderWithTheme(
      <Drawer open onClose={() => {}} title="Menu">
        <Text>Body</Text>
      </Drawer>,
      darkTheme,
    );
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });
});
