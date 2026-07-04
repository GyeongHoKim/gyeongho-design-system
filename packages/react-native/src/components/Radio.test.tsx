import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Radio } from './Radio.js';

describe('Radio', () => {
  it('renders its label with the radio role', () => {
    renderWithTheme(<Radio label="Small" value="sm" />);
    expect(screen.getByRole('radio', { name: 'Small' })).toBeInTheDocument();
  });

  it('checks uncontrolled via press', () => {
    renderWithTheme(<Radio label="Small" value="sm" />);
    const field = screen.getByRole('radio', { name: 'Small' });
    expect(field).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(field);
    expect(field).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onCheckedChange when pressed', () => {
    const onCheckedChange = vi.fn();
    renderWithTheme(<Radio label="Small" value="sm" onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Small' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', () => {
    const onCheckedChange = vi.fn();
    renderWithTheme(<Radio label="Small" value="sm" disabled onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Small' }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
