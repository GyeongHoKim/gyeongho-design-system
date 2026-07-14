import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { DatePicker } from './DatePicker.js';

describe('DatePicker', () => {
  it('shows the placeholder when no value is set', () => {
    renderWithTheme(<DatePicker label="Due" placeholder="Pick a day" testID="dp" />);
    expect(screen.getByText('Pick a day')).toBeInTheDocument();
    expect(screen.getByTestId('dp')).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the calendar and selects a date', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <DatePicker label="Due" value={new Date(2026, 6, 1)} onChange={onChange} testID="dp" />,
    );
    fireEvent.click(screen.getByTestId('dp'));
    expect(screen.getByText('July 2026')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(new Date(2026, 6, 20).toDateString()));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(20);
  });

  it('does not open when disabled (dark theme)', () => {
    renderWithTheme(<DatePicker label="Due" disabled testID="dp" />, darkTheme);
    fireEvent.click(screen.getByTestId('dp'));
    expect(screen.queryByText(/2026/)).toBeNull();
  });
});
