import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge.js';

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders a decorative sketch surface with fill geometry', () => {
    const { container } = render(<Badge variant="success">Done</Badge>);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('isolates the sketch layer in its own stacking context', () => {
    // Regression (GHD-44): the sketch surface paints at `z-index: -1` and must
    // stay scoped to the badge, or an opaque-background ancestor paints over it.
    const { container } = render(<Badge>x</Badge>);
    const svg = container.querySelector('svg');
    expect(svg?.parentElement).toHaveStyle({ isolation: 'isolate' });
  });

  it('forwards arbitrary props such as role to the root element', () => {
    render(
      <Badge role="status" aria-label="3 unread">
        3
      </Badge>,
    );
    expect(screen.getByRole('status', { name: '3 unread' })).toBeInTheDocument();
  });
});
