import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { Sheet } from './Sheet.js';

describe('Sheet', () => {
  it('renders the title and content when open', () => {
    renderWithTheme(
      <Sheet open onClose={() => {}} title="Filters">
        <Text>Body</Text>
      </Sheet>,
    );
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('closes from the scrim', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Sheet open onClose={onClose} side="left" title="Filters" testID="sheet">
        <Text>Body</Text>
      </Sheet>,
    );
    fireEvent.click(screen.getByTestId('sheet-scrim'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders a bottom sheet in dark theme', () => {
    renderWithTheme(
      <Sheet open onClose={() => {}} side="bottom" title="Filters">
        <Text>Body</Text>
      </Sheet>,
      darkTheme,
    );
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });
});
