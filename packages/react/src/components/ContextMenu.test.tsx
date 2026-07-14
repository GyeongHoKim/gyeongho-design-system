import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ContextMenu, type ContextMenuItem } from './ContextMenu.js';

const ITEMS: ContextMenuItem[] = [
  { value: 'copy', label: 'Copy' },
  { value: 'paste', label: 'Paste' },
  { value: 'delete', label: 'Delete', danger: true },
];

describe('ContextMenu', () => {
  it('opens on right-click and shows items', () => {
    render(
      <ContextMenu items={ITEMS}>
        <div>Right-click me</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('Right-click me'));
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });

  it('selects an item on click and closes', async () => {
    const onSelect = vi.fn();
    render(
      <ContextMenu items={ITEMS} onSelect={onSelect}>
        <div>Right-click me</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('Right-click me'));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Paste' }));
    expect(onSelect).toHaveBeenCalledWith('paste');
  });

  it('closes on Escape', async () => {
    render(
      <ContextMenu items={ITEMS}>
        <div>Right-click me</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('Right-click me'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
  });
});
