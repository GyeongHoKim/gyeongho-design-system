import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox.js';

describe('Checkbox', () => {
  it('associates the label with the input', () => {
    render(<Checkbox label="Subscribe" />);
    expect(screen.getByLabelText('Subscribe')).toBeInTheDocument();
  });

  it('renders a decorative sketch box', () => {
    const { container } = render(<Checkbox label="Subscribe" />);
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('isolates the sketch layer in its own stacking context', () => {
    // Regression (GHD-44): the sketch surface paints at `z-index: -1` and must
    // stay scoped to the control, or an opaque-background ancestor paints over it.
    const { container } = render(<Checkbox label="Subscribe" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.parentElement).toHaveStyle({ isolation: 'isolate' });
  });

  it('toggles uncontrolled via click', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Subscribe" />);
    const field = screen.getByLabelText('Subscribe') as HTMLInputElement;
    expect(field.checked).toBe(false);
    await user.click(field);
    expect(field.checked).toBe(true);
  });

  it('is keyboard operable via Space', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Subscribe" />);
    await user.tab();
    const field = screen.getByLabelText('Subscribe') as HTMLInputElement;
    expect(field).toHaveFocus();
    await user.keyboard(' ');
    expect(field.checked).toBe(true);
  });

  it('respects a controlled checked value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Subscribe" checked={false} onChange={onChange} />);
    const field = screen.getByLabelText('Subscribe') as HTMLInputElement;
    await user.click(field);
    expect(onChange).toHaveBeenCalledTimes(1);
    // Controlled: the caller didn't update `checked`, so it stays false.
    expect(field.checked).toBe(false);
  });

  it('shows the indeterminate mark and clears the DOM property when set', () => {
    const { rerender } = render(<Checkbox label="Select all" indeterminate />);
    const field = screen.getByLabelText('Select all') as HTMLInputElement;
    expect(field.indeterminate).toBe(true);

    rerender(<Checkbox label="Select all" indeterminate={false} />);
    expect(field.indeterminate).toBe(false);
  });

  it('disables the field', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Locked" disabled />);
    const field = screen.getByLabelText('Locked') as HTMLInputElement;
    expect(field).toBeDisabled();
    await user.click(field);
    expect(field.checked).toBe(false);
  });
});
