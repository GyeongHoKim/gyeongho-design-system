import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Checkbox } from './Checkbox.js';

describe('Checkbox', () => {
  it('renders its label with the checkbox role', () => {
    renderWithTheme(<Checkbox label="Subscribe" />);
    expect(screen.getByRole('checkbox', { name: 'Subscribe' })).toBeInTheDocument();
  });

  it('toggles uncontrolled via press', () => {
    renderWithTheme(<Checkbox label="Subscribe" />);
    const field = screen.getByRole('checkbox', { name: 'Subscribe' });
    expect(field).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(field);
    expect(field).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onCheckedChange with the next value', () => {
    const onCheckedChange = vi.fn();
    renderWithTheme(<Checkbox label="Subscribe" onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Subscribe' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('respects a controlled checked value', () => {
    const onCheckedChange = vi.fn();
    renderWithTheme(
      <Checkbox label="Subscribe" checked={false} onCheckedChange={onCheckedChange} />,
    );
    const field = screen.getByRole('checkbox', { name: 'Subscribe' });
    fireEvent.click(field);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    // Controlled: the caller didn't update `checked`, so it stays false.
    expect(field).toHaveAttribute('aria-checked', 'false');
  });

  it('exposes mixed via aria-checked when indeterminate', () => {
    renderWithTheme(<Checkbox label="Select all" indeterminate />);
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute(
      'aria-checked',
      'mixed',
    );
  });

  it('does not toggle when disabled', () => {
    const onCheckedChange = vi.fn();
    renderWithTheme(<Checkbox label="Locked" disabled onCheckedChange={onCheckedChange} />);
    const field = screen.getByRole('checkbox', { name: 'Locked' });
    expect(field).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(field);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
