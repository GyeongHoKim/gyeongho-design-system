import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Kbd } from './Kbd.js';

describe('Kbd', () => {
  it('renders a <kbd> element with its content', () => {
    render(<Kbd>Ctrl</Kbd>);
    const el = screen.getByText('Ctrl');
    expect(el.closest('kbd')).not.toBeNull();
  });

  it('renders a decorative sketch surface', () => {
    const { container } = render(<Kbd>K</Kbd>);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('isolates the sketch layer in its own stacking context', () => {
    const { container } = render(<Kbd>K</Kbd>);
    const svg = container.querySelector('svg');
    expect(svg?.parentElement).toHaveStyle({ isolation: 'isolate' });
  });
});
