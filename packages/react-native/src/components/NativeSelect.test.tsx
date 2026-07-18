import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { NativeSelect } from './NativeSelect.js';

const ITEMS = [
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' },
];

describe('NativeSelect', () => {
  it('renders an option per item', () => {
    renderWithTheme(<NativeSelect items={ITEMS} testID="colour" />);
    const select = screen.getByTestId('colour');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Green')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
  });

  it('renders a leading placeholder option', () => {
    renderWithTheme(<NativeSelect items={ITEMS} placeholder="Choose a colour" testID="colour" />);
    expect(screen.getByText('Choose a colour')).toBeInTheDocument();
  });

  it('reports the chosen value on change', () => {
    const onValueChange = vi.fn();
    renderWithTheme(<NativeSelect items={ITEMS} testID="colour" onValueChange={onValueChange} />);
    fireEvent.change(screen.getByTestId('colour'), { target: { value: 'green' } });
    expect(onValueChange).toHaveBeenCalledWith('green');
  });

  it('renders a visible label', () => {
    renderWithTheme(<NativeSelect items={ITEMS} label="Favourite colour" />);
    expect(screen.getByText('Favourite colour')).toBeInTheDocument();
  });

  it('announces an error message', () => {
    renderWithTheme(<NativeSelect items={ITEMS} error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
  });

  it('is disabled when disabled is set', () => {
    renderWithTheme(<NativeSelect items={ITEMS} disabled testID="colour" />);
    expect(screen.getByTestId('colour')).toBeDisabled();
  });
});
