import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Select, type SelectOption } from './Select.js';

const FRUIT_OPTIONS: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
];

// `measureInWindow` (react-native-web) resolves via a macrotask (`setTimeout`),
// not synchronously — poll for the resulting state update instead of racing a
// single fixed-delay timer against it.
function waitForOpen(trigger: HTMLElement): Promise<void> {
  return waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
}

describe('Select', () => {
  it('renders its label with the combobox role', () => {
    renderWithTheme(<Select label="Fruit" options={FRUIT_OPTIONS} placeholder="Choose a fruit" />);
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toBeInTheDocument();
  });

  it('shows the placeholder when nothing is selected', () => {
    renderWithTheme(<Select label="Fruit" options={FRUIT_OPTIONS} placeholder="Choose a fruit" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Choose a fruit');
  });

  it('opens the panel on press and selects an option, calling onValueChange', async () => {
    const onValueChange = vi.fn();
    renderWithTheme(<Select label="Fruit" options={FRUIT_OPTIONS} onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    await waitForOpen(trigger);

    fireEvent.click(screen.getByRole('menuitem', { name: 'Banana' }));

    expect(onValueChange).toHaveBeenCalledWith('banana');
  });

  it('does not select a disabled option', async () => {
    const onValueChange = vi.fn();
    renderWithTheme(<Select label="Fruit" options={FRUIT_OPTIONS} onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    await waitForOpen(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Cherry' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('does not open when disabled', async () => {
    renderWithTheme(<Select label="Fruit" options={FRUIT_OPTIONS} disabled />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    // No macrotask ever fires `setOpen(true)` here (handleOpen bails out
    // early when disabled), so there's nothing to await — assert immediately.
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows the selected option label on the trigger', () => {
    renderWithTheme(<Select label="Fruit" options={FRUIT_OPTIONS} value="banana" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
  });
});
