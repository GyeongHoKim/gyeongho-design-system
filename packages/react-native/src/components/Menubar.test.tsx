import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Menubar, type MenubarMenu } from './Menubar.js';

const MENUS: MenubarMenu[] = [
  {
    value: 'file',
    label: 'File',
    items: [
      { value: 'new', label: 'New' },
      { value: 'open', label: 'Open' },
    ],
  },
  {
    value: 'edit',
    label: 'Edit',
    items: [{ value: 'undo', label: 'Undo' }],
  },
];

describe('Menubar', () => {
  it('renders the top-level triggers', () => {
    renderWithTheme(<Menubar menus={MENUS} accessibilityLabel="Main" testID="mb" />);
    expect(screen.getByRole('button', { name: 'File' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('opens a menu and selects an item with the menu value', () => {
    const onSelect = vi.fn();
    renderWithTheme(<Menubar menus={MENUS} onSelect={onSelect} testID="mb" />);
    fireEvent.click(screen.getByRole('button', { name: 'File' }));
    fireEvent.click(screen.getByText('Open'));
    expect(onSelect).toHaveBeenCalledWith('file', 'open');
  });

  it('renders in dark theme', () => {
    renderWithTheme(<Menubar menus={MENUS} testID="mb" />, darkTheme);
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });
});
