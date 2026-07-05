import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Switch } from './Switch.js';

describe('Switch', () => {
  it('associates the label with the input', () => {
    render(<Switch label="Notifications" />);
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
  });

  it('exposes the switch role with aria-checked', () => {
    render(<Switch label="Notifications" />);
    const field = screen.getByRole('switch', { name: 'Notifications' });
    expect(field).toHaveAttribute('aria-checked', 'false');
  });

  it('renders a decorative sketch track', () => {
    const { container } = render(<Switch label="Notifications" />);
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('isolates the sketch layer in its own stacking context', () => {
    // Regression (GHD-44): the sketch surface paints at `z-index: -1` and must
    // stay scoped to the control, or an opaque-background ancestor paints over it.
    const { container } = render(<Switch label="Notifications" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.parentElement).toHaveStyle({ isolation: 'isolate' });
  });

  it('toggles uncontrolled via click, updating aria-checked', async () => {
    const user = userEvent.setup();
    render(<Switch label="Notifications" />);
    const field = screen.getByRole('switch', { name: 'Notifications' });
    await user.click(field);
    expect(field).toHaveAttribute('aria-checked', 'true');
  });

  it('is keyboard operable via Space', async () => {
    const user = userEvent.setup();
    render(<Switch label="Notifications" />);
    await user.tab();
    const field = screen.getByRole('switch', { name: 'Notifications' });
    expect(field).toHaveFocus();
    await user.keyboard(' ');
    expect(field).toHaveAttribute('aria-checked', 'true');
  });

  it('disables the field', () => {
    render(<Switch label="Notifications" disabled />);
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeDisabled();
  });
});
