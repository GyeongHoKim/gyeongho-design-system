import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from './DatePicker.js';

describe('DatePicker', () => {
  it('renders a trigger with the placeholder when empty', () => {
    render(<DatePicker label="Due date" placeholder="Pick a day" />);
    expect(screen.getByText('Pick a day')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('shows the formatted selected value', () => {
    render(
      <DatePicker label="Due date" value={new Date(2026, 5, 15)} format={() => 'Jun 15, 2026'} />,
    );
    expect(screen.getByText('Jun 15, 2026')).toBeInTheDocument();
  });

  it('opens the calendar and selects a date', async () => {
    const onChange = vi.fn();
    render(
      <DatePicker label="Due date" defaultValue={new Date(2026, 5, 10)} onChange={onChange} />,
    );
    // Only the field trigger is accessible while the popover is closed.
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('grid')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Mon Jun 15 2026' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(15);
  });
});
