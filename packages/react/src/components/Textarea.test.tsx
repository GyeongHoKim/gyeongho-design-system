import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Textarea } from './Textarea.js';

function mockScrollHeight(el: HTMLElement, value: number): void {
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value });
}

describe('Textarea', () => {
  it('associates the label with the textarea', () => {
    render(<Textarea label="Bio" />);
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
  });

  it('accepts typed text', async () => {
    const user = userEvent.setup();
    render(<Textarea label="Notes" />);
    const field = screen.getByLabelText('Notes');
    await user.type(field, 'Ada');
    expect(field).toHaveValue('Ada');
  });

  it('renders a decorative sketch box', () => {
    const { container } = render(<Textarea label="City" />);
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('isolates the sketch layer in its own stacking context', () => {
    // Regression (GHD-44): the sketch surface paints at `z-index: -1` and must
    // stay scoped to the control, or an opaque-background ancestor paints over it.
    const { container } = render(<Textarea label="City" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.parentElement).toHaveStyle({ isolation: 'isolate' });
  });

  it('marks the field invalid and announces the error', () => {
    render(<Textarea label="Bio" error="Required" />);
    const field = screen.getByLabelText('Bio');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Required');
    expect(field).toHaveAttribute('aria-describedby', alert.id);
  });

  it('disables the field', async () => {
    const user = userEvent.setup();
    render(<Textarea label="Locked" disabled />);
    const field = screen.getByLabelText('Locked');
    expect(field).toBeDisabled();
    await user.type(field, 'x');
    expect(field).toHaveValue('');
  });

  it('never shows the native resize handle', () => {
    render(<Textarea label="Bio" />);
    expect(screen.getByLabelText('Bio')).toHaveStyle({ resize: 'none' });
  });

  it('grows to fit its content when autoResize is set', () => {
    render(<Textarea label="Bio" autoResize />);
    const field = screen.getByLabelText('Bio') as HTMLTextAreaElement;
    mockScrollHeight(field, 120);
    fireEvent.change(field, { target: { value: 'line1\nline2\nline3' } });
    expect(field.style.height).toBe('120px');
  });

  it('does not touch height when autoResize is unset', () => {
    render(<Textarea label="Bio" />);
    const field = screen.getByLabelText('Bio') as HTMLTextAreaElement;
    mockScrollHeight(field, 120);
    fireEvent.change(field, { target: { value: 'line1\nline2\nline3' } });
    expect(field.style.height).toBe('');
  });

  it('syncs height on mount for an uncontrolled defaultValue, not just after the first keystroke', () => {
    render(<Textarea label="Bio" autoResize defaultValue={'line1\nline2\nline3'} />);
    const field = screen.getByLabelText('Bio') as HTMLTextAreaElement;
    // jsdom's scrollHeight is always 0, but a non-empty height proves the sync
    // ran on mount — before this fix it stayed '' until the user's first keystroke.
    expect(field.style.height).toBe('0px');
  });

  it('resets the JS-set height back to auto when autoResize toggles off', () => {
    const { rerender } = render(<Textarea label="Bio" autoResize />);
    const field = screen.getByLabelText('Bio') as HTMLTextAreaElement;
    mockScrollHeight(field, 200);
    fireEvent.change(field, { target: { value: 'line1\nline2\nline3' } });
    expect(field.style.height).toBe('200px');

    rerender(<Textarea label="Bio" autoResize={false} />);
    expect(field.style.height).toBe('');
  });
});
