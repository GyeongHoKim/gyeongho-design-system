import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from './Toggle.js';

describe('Toggle', () => {
  it('renders unpressed by default', () => {
    render(<Toggle>Bold</Toggle>);
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles on click when uncontrolled', async () => {
    const onPressedChange = vi.fn();
    render(<Toggle onPressedChange={onPressedChange}>Bold</Toggle>);
    const btn = screen.getByRole('button', { name: 'Bold' });
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it('respects the controlled pressed prop', async () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle pressed onPressedChange={onPressedChange}>
        Bold
      </Toggle>,
    );
    const btn = screen.getByRole('button', { name: 'Bold' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(btn);
    // Controlled: stays as the prop dictates until parent updates.
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(onPressedChange).toHaveBeenCalledWith(false);
  });

  it('does not toggle when disabled', async () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle disabled onPressedChange={onPressedChange}>
        Bold
      </Toggle>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Bold' }));
    expect(onPressedChange).not.toHaveBeenCalled();
  });
});
