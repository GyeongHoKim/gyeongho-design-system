import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Command, type CommandItem } from './Command.js';

const ITEMS: CommandItem[] = [
  { value: 'new', label: 'New file', group: 'File' },
  { value: 'open', label: 'Open file', group: 'File' },
  { value: 'theme', label: 'Toggle theme', group: 'View', keywords: ['dark', 'light'] },
];

describe('Command', () => {
  it('renders nothing when closed', () => {
    renderWithTheme(<Command open={false} onClose={() => {}} items={ITEMS} />);
    expect(screen.queryByText('New file')).toBeNull();
  });

  it('lists commands and group headings when open', () => {
    renderWithTheme(<Command open onClose={() => {}} items={ITEMS} testID="cmd" />);
    expect(screen.getByText('New file')).toBeInTheDocument();
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
  });

  it('filters by label and keywords', () => {
    renderWithTheme(<Command open onClose={() => {}} items={ITEMS} testID="cmd" />);
    fireEvent.change(screen.getByTestId('cmd-search'), { target: { value: 'dark' } });
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
    expect(screen.queryByText('New file')).toBeNull();
  });

  it('shows empty text when nothing matches', () => {
    renderWithTheme(
      <Command open onClose={() => {}} items={ITEMS} emptyText="Nothing" testID="cmd" />,
    );
    fireEvent.change(screen.getByTestId('cmd-search'), { target: { value: 'zzz' } });
    expect(screen.getByText('Nothing')).toBeInTheDocument();
  });

  it('selects a command and closes (dark theme)', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    renderWithTheme(
      <Command open onClose={onClose} items={ITEMS} onSelect={onSelect} testID="cmd" />,
      darkTheme,
    );
    fireEvent.click(screen.getByText('Open file'));
    expect(onSelect).toHaveBeenCalledWith('open');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
