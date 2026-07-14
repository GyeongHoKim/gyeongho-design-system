import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Combobox, type ComboboxOption } from './Combobox.js';

const OPTIONS: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('Combobox', () => {
  it('renders a collapsed combobox input', () => {
    render(<Combobox options={OPTIONS} label="Fruit" />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('opens and filters options as the user types', async () => {
    render(<Combobox options={OPTIONS} label="Fruit" />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await userEvent.type(input, 'ban');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Banana');
  });

  it('selects an option on click and fills the input', async () => {
    const onValueChange = vi.fn();
    render(<Combobox options={OPTIONS} label="Fruit" onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await userEvent.click(input);
    await userEvent.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onValueChange).toHaveBeenCalledWith('cherry');
    expect(input).toHaveValue('Cherry');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('selects the highlighted option with the keyboard', async () => {
    const onValueChange = vi.fn();
    render(<Combobox options={OPTIONS} label="Fruit" onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    input.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('banana');
  });

  it('shows an empty message when nothing matches', async () => {
    render(<Combobox options={OPTIONS} label="Fruit" emptyMessage="Nothing found" />);
    await userEvent.type(screen.getByRole('combobox', { name: 'Fruit' }), 'zzz');
    expect(screen.getByText('Nothing found')).toBeInTheDocument();
  });
});
