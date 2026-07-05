import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Select, SelectOption } from './Select.js';

function Fruits(props: Partial<ComponentProps<typeof Select>> = {}) {
  return (
    <Select label="Fruit" placeholder="Choose a fruit" {...props}>
      <SelectOption value="apple">Apple</SelectOption>
      <SelectOption value="banana">Banana</SelectOption>
      <SelectOption value="cherry" disabled>
        Cherry
      </SelectOption>
      <SelectOption value="date">Date</SelectOption>
    </Select>
  );
}

describe('Select', () => {
  it('associates the label with the trigger', () => {
    render(<Fruits />);
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toBeInTheDocument();
  });

  it('shows the placeholder when nothing is selected', () => {
    render(<Fruits />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Choose a fruit');
  });

  it('opens the listbox on click and closes it on option click, calling onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Fruits onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox');

    await user.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onValueChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveTextContent('Banana');
  });

  it('does not call onValueChange when a disabled option is clicked', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Fruits onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onValueChange).not.toHaveBeenCalled();
    // Clicking a disabled option does not close the panel either.
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('reflects a controlled value without self-updating on selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Fruits value="apple" onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveTextContent('Apple');

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onValueChange).toHaveBeenCalledWith('banana');
    // Parent never updated `value`, so the trigger still shows the old selection.
    expect(trigger).toHaveTextContent('Apple');
  });

  it('opens and highlights the first option on ArrowDown, then moves the highlight', async () => {
    const user = userEvent.setup();
    render(<Fruits />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Apple' }).id,
    );

    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Banana' }).id,
    );
  });

  it('skips disabled options when moving the highlight', async () => {
    const user = userEvent.setup();
    render(<Fruits />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{ArrowDown}'); // Apple
    await user.keyboard('{ArrowDown}'); // Banana
    await user.keyboard('{ArrowDown}'); // Cherry is disabled, should skip to Date
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Date' }).id,
    );
  });

  it('jumps to the first/last enabled option on Home/End', async () => {
    const user = userEvent.setup();
    render(<Fruits />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{End}');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Date' }).id,
    );
    await user.keyboard('{Home}');
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Apple' }).id,
    );
  });

  it('selects the highlighted option on Enter and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Fruits onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('banana');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes on Escape without selecting, keeping focus on the trigger', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Fruits onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{ArrowDown}{Escape}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('jumps to a matching option via typeahead', async () => {
    const user = userEvent.setup();
    render(<Fruits />);
    const trigger = screen.getByRole('combobox');
    trigger.focus();
    await user.keyboard('{ArrowDown}'); // open, highlight Apple
    await user.keyboard('da'); // typeahead -> Date
    expect(trigger).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Date' }).id,
    );
  });

  it('closes when clicking outside the trigger and panel', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Fruits />
        <button type="button">Outside</button>
      </div>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not open when disabled', async () => {
    const user = userEvent.setup();
    render(<Fruits disabled />);
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('positions the panel with a fixed-position style once open', async () => {
    const user = userEvent.setup();
    render(<Fruits />);
    await user.click(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveStyle({ position: 'fixed' });
  });
});
