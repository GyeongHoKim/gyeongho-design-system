import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from './Calendar.js';

// A fixed month so the grid is deterministic: June 2026 (1st is a Monday).
const JUNE_2026 = new Date(2026, 5, 15);

describe('Calendar', () => {
  it('renders a labelled grid with the displayed month', () => {
    render(<Calendar defaultMonth={JUNE_2026} aria-label="Choose date" />);
    expect(screen.getByRole('grid', { name: 'Choose date' })).toBeInTheDocument();
    expect(screen.getByText('June 2026')).toBeInTheDocument();
  });

  it('selects a day on click', async () => {
    const onSelect = vi.fn();
    render(<Calendar defaultMonth={JUNE_2026} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Mon Jun 15 2026' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toBeInstanceOf(Date);
    expect((onSelect.mock.calls[0][0] as Date).getDate()).toBe(15);
  });

  it('marks the selected day with aria-pressed', () => {
    render(<Calendar value={JUNE_2026} defaultMonth={JUNE_2026} />);
    expect(screen.getByRole('button', { name: 'Mon Jun 15 2026' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('moves focus with arrow keys (roving tabindex)', async () => {
    render(<Calendar value={JUNE_2026} defaultMonth={JUNE_2026} />);
    const day15 = screen.getByRole('button', { name: 'Mon Jun 15 2026' });
    expect(day15).toHaveAttribute('tabindex', '0');
    day15.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Tue Jun 16 2026' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Tue Jun 23 2026' })).toHaveFocus();
  });

  it('changes month with the navigation buttons', async () => {
    render(<Calendar defaultMonth={JUNE_2026} />);
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByText('July 2026')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByText('May 2026')).toBeInTheDocument();
  });

  it('does not select a disabled day', async () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        defaultMonth={JUNE_2026}
        onSelect={onSelect}
        isDateDisabled={(d) => d.getDate() === 20}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Sat Jun 20 2026' }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
