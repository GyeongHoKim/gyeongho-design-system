import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Calendar } from './Calendar.js';

describe('Calendar', () => {
  it('renders the month heading for the default month', () => {
    renderWithTheme(<Calendar defaultMonth={new Date(2026, 6, 1)} testID="cal" />);
    expect(screen.getByText('July 2026')).toBeInTheDocument();
  });

  it('navigates to the previous and next month', () => {
    renderWithTheme(<Calendar defaultMonth={new Date(2026, 6, 1)} testID="cal" />);
    fireEvent.click(screen.getByTestId('cal-prev'));
    expect(screen.getByText('June 2026')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('cal-next'));
    fireEvent.click(screen.getByTestId('cal-next'));
    expect(screen.getByText('August 2026')).toBeInTheDocument();
  });

  it('fires onChange with the tapped date', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Calendar defaultMonth={new Date(2026, 6, 1)} onChange={onChange} testID="cal" />,
    );
    fireEvent.click(screen.getByLabelText(new Date(2026, 6, 15).toDateString()));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(15);
  });

  it('does not select a disabled out-of-range date (dark theme)', () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Calendar
        defaultMonth={new Date(2026, 6, 1)}
        minDate={new Date(2026, 6, 10)}
        onChange={onChange}
        testID="cal"
      />,
      darkTheme,
    );
    fireEvent.click(screen.getByLabelText(new Date(2026, 6, 5).toDateString()));
    expect(onChange).not.toHaveBeenCalled();
  });
});
