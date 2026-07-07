import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Menu, type MenuItem } from './Menu.js';

const ITEMS: MenuItem[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'delete', label: 'Delete' },
];

describe('Menu', () => {
  it('renders a collapsed trigger', () => {
    renderWithTheme(<Menu label="Actions" items={ITEMS} testID="menu" />);
    expect(screen.getByTestId('menu')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Edit')).toBeNull();
  });

  it('opens on press and shows the items', () => {
    renderWithTheme(<Menu label="Actions" items={ITEMS} testID="menu" />);
    fireEvent.click(screen.getByTestId('menu'));
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('fires onSelect with the item value and closes', () => {
    const onSelect = vi.fn();
    renderWithTheme(<Menu label="Actions" items={ITEMS} onSelect={onSelect} testID="menu" />);
    fireEvent.click(screen.getByTestId('menu'));
    fireEvent.click(screen.getByText('Duplicate'));
    expect(onSelect).toHaveBeenCalledWith('duplicate');
  });
});
