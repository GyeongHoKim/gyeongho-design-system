import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Command, CommandDialog, type CommandGroup } from './Command.js';

const GROUPS: CommandGroup[] = [
  {
    heading: 'Suggestions',
    items: [
      { value: 'calendar', label: 'Calendar' },
      { value: 'search', label: 'Search emoji', keywords: ['icon'] },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { value: 'profile', label: 'Profile' },
      { value: 'billing', label: 'Billing' },
    ],
  },
];

describe('Command', () => {
  it('renders a combobox and grouped options', () => {
    render(<Command groups={GROUPS} autoFocus={false} aria-label="Command palette" />);
    expect(screen.getByRole('combobox', { name: 'Command palette' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(screen.getAllByRole('group')).toHaveLength(2);
  });

  it('filters options by the query (including keywords)', async () => {
    render(<Command groups={GROUPS} autoFocus={false} aria-label="Command palette" />);
    await userEvent.type(screen.getByRole('combobox'), 'icon');
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Search emoji');
  });

  it('runs the highlighted command with Enter', async () => {
    const onSelect = vi.fn();
    render(
      <Command
        groups={GROUPS}
        onSelect={onSelect}
        autoFocus={false}
        aria-label="Command palette"
      />,
    );
    const input = screen.getByRole('combobox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith('search');
  });

  it('shows the empty message when nothing matches', async () => {
    render(
      <Command
        groups={GROUPS}
        autoFocus={false}
        emptyMessage="Nothing"
        aria-label="Command palette"
      />,
    );
    await userEvent.type(screen.getByRole('combobox'), 'zzz');
    expect(screen.getByText('Nothing')).toBeInTheDocument();
  });

  it('CommandDialog renders inside a modal dialog when open', () => {
    render(<CommandDialog open onClose={() => {}} groups={GROUPS} aria-label="Command palette" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Command palette' })).toBeInTheDocument();
  });
});
