import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Switch } from './Switch.js';

describe('Switch', () => {
  it('renders its label with the switch role', () => {
    renderWithTheme(<Switch label="Notifications" />);
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('toggles uncontrolled via press', () => {
    renderWithTheme(<Switch label="Notifications" />);
    const field = screen.getByRole('switch', { name: 'Notifications' });
    expect(field).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(field);
    expect(field).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onCheckedChange with the next value', () => {
    const onCheckedChange = vi.fn();
    renderWithTheme(<Switch label="Notifications" onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Notifications' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', () => {
    const onCheckedChange = vi.fn();
    renderWithTheme(<Switch label="Notifications" disabled onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Notifications' }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
