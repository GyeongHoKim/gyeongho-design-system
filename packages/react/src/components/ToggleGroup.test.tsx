import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToggleGroup, type ToggleGroupItem } from './ToggleGroup.js';

const ITEMS: ToggleGroupItem[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

describe('ToggleGroup', () => {
  it('renders a labelled group of toggles', () => {
    render(<ToggleGroup type="single" items={ITEMS} aria-label="Alignment" />);
    expect(screen.getByRole('group', { name: 'Alignment' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('single mode selects one value at a time', async () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup
        type="single"
        items={ITEMS}
        aria-label="Alignment"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Left' }));
    expect(onValueChange).toHaveBeenLastCalledWith('left');
    expect(screen.getByRole('button', { name: 'Left' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Center' }));
    expect(onValueChange).toHaveBeenLastCalledWith('center');
  });

  it('multiple mode accumulates values', async () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup
        type="multiple"
        items={ITEMS}
        aria-label="Formatting"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Left' }));
    await userEvent.click(screen.getByRole('button', { name: 'Right' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['left', 'right']);
  });

  it('uses roving tabindex and moves focus with arrow keys', async () => {
    render(<ToggleGroup type="single" items={ITEMS} aria-label="Alignment" />);
    const [left, center] = screen.getAllByRole('button');
    expect(left).toHaveAttribute('tabindex', '0');
    expect(center).toHaveAttribute('tabindex', '-1');
    left.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(center).toHaveFocus();
  });
});
