import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Toggle } from './Toggle.js';

describe('Toggle', () => {
  it('renders unpressed with the button role', () => {
    renderWithTheme(<Toggle label="Bold" />);
    const btn = screen.getByRole('button', { name: 'Bold' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles uncontrolled via press', () => {
    renderWithTheme(<Toggle label="Bold" />);
    const btn = screen.getByRole('button', { name: 'Bold' });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onPressedChange with the next value', () => {
    const onPressedChange = vi.fn();
    renderWithTheme(<Toggle label="Bold" onPressedChange={onPressedChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Bold' }));
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle when disabled', () => {
    const onPressedChange = vi.fn();
    renderWithTheme(<Toggle label="Bold" disabled onPressedChange={onPressedChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Bold' }));
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  it('reflects a controlled pressed prop in dark theme', () => {
    const onPressedChange = vi.fn();
    renderWithTheme(<Toggle label="Bold" pressed onPressedChange={onPressedChange} />, darkTheme);
    const btn = screen.getByRole('button', { name: 'Bold' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(btn);
    // Parent didn't update `pressed`, so the rendered state stays on.
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(onPressedChange).toHaveBeenCalledWith(false);
  });
});
