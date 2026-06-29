import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card.js';

describe('Card', () => {
  it('renders its children', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Body copy</p>
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('Body copy')).toBeInTheDocument();
  });

  it('renders a decorative sketch surface with fill geometry', () => {
    const { container } = render(<Card>content</Card>);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('forwards arbitrary props such as role to the root element', () => {
    render(
      <Card role="region" aria-label="Stats">
        x
      </Card>,
    );
    expect(screen.getByRole('region', { name: 'Stats' })).toBeInTheDocument();
  });
});
