import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Separator } from './Separator.js';

describe('Separator', () => {
  it('renders a horizontal separator by default', () => {
    render(<Separator />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('exposes the vertical orientation', () => {
    render(<Separator orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('is not announced when decorative', () => {
    const { container } = render(<Separator decorative />);
    expect(screen.queryByRole('separator')).toBeNull();
    expect(container.firstChild).toHaveAttribute('role', 'none');
  });

  it('renders a decorative sketch line', () => {
    const { container } = render(<Separator />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });
});
