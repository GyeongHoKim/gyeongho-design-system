import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Menubar, type MenubarMenu } from './Menubar.js';

const MENUS: MenubarMenu[] = [
  {
    label: 'File',
    items: [
      { value: 'new', label: 'New' },
      { value: 'open', label: 'Open' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { value: 'undo', label: 'Undo' },
      { value: 'redo', label: 'Redo' },
    ],
  },
];

describe('Menubar', () => {
  it('renders a menubar of menu buttons', () => {
    render(<Menubar menus={MENUS} aria-label="Main" />);
    expect(screen.getByRole('menubar', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'File' })).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('opens a menu on click and selects an item', async () => {
    const onSelect = vi.fn();
    render(<Menubar menus={MENUS} onSelect={onSelect} aria-label="Main" />);
    await userEvent.click(screen.getByRole('menuitem', { name: 'File' }));
    expect(screen.getByRole('menuitem', { name: 'Open' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Open' }));
    expect(onSelect).toHaveBeenCalledWith('open');
  });

  it('moves focus between triggers with arrow keys (roving tabindex)', async () => {
    render(<Menubar menus={MENUS} aria-label="Main" />);
    const file = screen.getByRole('menuitem', { name: 'File' });
    const edit = screen.getByRole('menuitem', { name: 'Edit' });
    expect(file).toHaveAttribute('tabindex', '0');
    expect(edit).toHaveAttribute('tabindex', '-1');
    file.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(edit).toHaveFocus();
  });

  it('closes on Escape', async () => {
    render(<Menubar menus={MENUS} aria-label="Main" />);
    await userEvent.click(screen.getByRole('menuitem', { name: 'File' }));
    expect(screen.getByRole('menuitem', { name: 'New' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menuitem', { name: 'New' })).toBeNull();
  });
});
