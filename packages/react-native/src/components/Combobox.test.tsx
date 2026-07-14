import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Combobox } from './Combobox.js';
import type { SelectOption } from './Select.js';

const OPTIONS: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('Combobox', () => {
  it('renders a collapsed trigger with the placeholder', () => {
    renderWithTheme(
      <Combobox label="Fruit" options={OPTIONS} placeholder="Pick one" testID="cb" />,
    );
    expect(screen.getByTestId('cb')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('opens and lists all options', () => {
    renderWithTheme(<Combobox label="Fruit" options={OPTIONS} testID="cb" />);
    fireEvent.click(screen.getByTestId('cb'));
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('filters options by the search query', () => {
    renderWithTheme(<Combobox label="Fruit" options={OPTIONS} testID="cb" />);
    fireEvent.click(screen.getByTestId('cb'));
    fireEvent.change(screen.getByTestId('cb-search'), { target: { value: 'ban' } });
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).toBeNull();
  });

  it('shows the empty text when nothing matches', () => {
    renderWithTheme(
      <Combobox label="Fruit" options={OPTIONS} emptyText="Nothing found" testID="cb" />,
    );
    fireEvent.click(screen.getByTestId('cb'));
    fireEvent.change(screen.getByTestId('cb-search'), { target: { value: 'zzz' } });
    expect(screen.getByText('Nothing found')).toBeInTheDocument();
  });

  it('selects an option and fires onValueChange (dark theme)', () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <Combobox label="Fruit" options={OPTIONS} onValueChange={onValueChange} testID="cb" />,
      darkTheme,
    );
    fireEvent.click(screen.getByTestId('cb'));
    fireEvent.click(screen.getByText('Cherry'));
    expect(onValueChange).toHaveBeenCalledWith('cherry');
  });
});
