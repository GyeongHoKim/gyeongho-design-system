import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup.js';

describe('ToggleGroup', () => {
  it('renders its items', () => {
    renderWithTheme(
      <ToggleGroup accessibilityLabel="Align" testID="grp">
        <ToggleGroupItem value="left" label="Left" />
        <ToggleGroupItem value="center" label="Center" />
      </ToggleGroup>,
    );
    expect(screen.getByRole('button', { name: 'Left' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Center' })).toBeInTheDocument();
  });

  it('selects a single value and reflects aria-pressed', () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <ToggleGroup type="single" onValueChange={onValueChange}>
        <ToggleGroupItem value="left" label="Left" />
        <ToggleGroupItem value="center" label="Center" />
      </ToggleGroup>,
    );
    const left = screen.getByRole('button', { name: 'Left' });
    expect(left).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(left);
    expect(onValueChange).toHaveBeenCalledWith(['left']);
    expect(left).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps at most one selected in single mode', () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <ToggleGroup type="single" defaultValue={['left']} onValueChange={onValueChange}>
        <ToggleGroupItem value="left" label="Left" />
        <ToggleGroupItem value="center" label="Center" />
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Center' }));
    expect(onValueChange).toHaveBeenCalledWith(['center']);
  });

  it('accumulates selection in multiple mode (dark theme)', () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <ToggleGroup type="multiple" defaultValue={['left']} onValueChange={onValueChange}>
        <ToggleGroupItem value="left" label="Left" />
        <ToggleGroupItem value="center" label="Center" />
      </ToggleGroup>,
      darkTheme,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Center' }));
    expect(onValueChange).toHaveBeenCalledWith(['left', 'center']);
  });

  it('does not toggle disabled items', () => {
    const onValueChange = vi.fn();
    renderWithTheme(
      <ToggleGroup onValueChange={onValueChange}>
        <ToggleGroupItem value="left" label="Left" disabled />
      </ToggleGroup>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Left' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
