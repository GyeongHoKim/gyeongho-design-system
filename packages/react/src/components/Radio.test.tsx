import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Radio } from './Radio.js';

describe('Radio', () => {
  it('associates the label with the input', () => {
    render(<Radio label="Small" value="sm" />);
    expect(screen.getByLabelText('Small')).toBeInTheDocument();
  });

  it('renders a decorative sketch ring', () => {
    const { container } = render(<Radio label="Small" value="sm" />);
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('isolates the sketch layer in its own stacking context', () => {
    // Regression (GHD-44): the sketch surface paints at `z-index: -1` and must
    // stay scoped to the control, or an opaque-background ancestor paints over it.
    const { container } = render(<Radio label="Small" value="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.parentElement).toHaveStyle({ isolation: 'isolate' });
  });

  it('toggles uncontrolled via click', async () => {
    const user = userEvent.setup();
    render(<Radio label="Small" value="sm" />);
    const field = screen.getByLabelText('Small') as HTMLInputElement;
    expect(field.checked).toBe(false);
    await user.click(field);
    expect(field.checked).toBe(true);
  });

  it('is keyboard operable via Space', async () => {
    const user = userEvent.setup();
    render(<Radio label="Small" value="sm" />);
    await user.tab();
    const field = screen.getByLabelText('Small') as HTMLInputElement;
    expect(field).toHaveFocus();
    await user.keyboard(' ');
    expect(field.checked).toBe(true);
  });

  it('disables the field', () => {
    render(<Radio label="Small" value="sm" disabled />);
    expect(screen.getByLabelText('Small')).toBeDisabled();
  });
});
