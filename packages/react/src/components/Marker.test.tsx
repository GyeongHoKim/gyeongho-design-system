import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Marker } from './Marker.js';

describe('Marker', () => {
  it('highlights its text in a semantic <mark>', () => {
    render(<Marker>important</Marker>);
    const mark = screen.getByText('important').closest('mark');
    expect(mark).not.toBeNull();
  });

  it('paints a decorative sketch highlight', () => {
    const { container } = render(<Marker>x</Marker>);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('forwards arbitrary props to the mark element', () => {
    render(<Marker data-testid="m">x</Marker>);
    expect(screen.getByTestId('m').tagName.toLowerCase()).toBe('mark');
  });
});
