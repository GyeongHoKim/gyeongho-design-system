import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, type CardVariant } from './Card.js';

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

  it('isolates the sketch layer in its own stacking context', () => {
    // Regression (GHD-44): the sketch surface paints at `z-index: -1` and must
    // stay scoped to the card, or an opaque-background ancestor paints over it.
    const { container } = render(<Card>content</Card>);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.parentElement).toHaveStyle({ isolation: 'isolate' });
  });

  it('forwards arbitrary props such as role to the root element', () => {
    render(
      <Card role="region" aria-label="Stats">
        x
      </Card>,
    );
    expect(screen.getByRole('region', { name: 'Stats' })).toBeInTheDocument();
  });

  describe('paper variants', () => {
    it('renders no sketch surface for sticky and lined', () => {
      const sticky = render(<Card variant="sticky">x</Card>);
      expect(sticky.container.querySelector('svg')).toBeNull();
      const lined = render(<Card variant="lined">x</Card>);
      expect(lined.container.querySelector('svg')).toBeNull();
    });

    it('draws the lined margin line as a decorative element on the inline-start edge', () => {
      const { container } = render(<Card variant="lined">x</Card>);
      const line = container.querySelector('[data-card-margin-line]') as HTMLElement;
      expect(line).not.toBeNull();
      expect(line).toHaveAttribute('aria-hidden', 'true');
      expect(line.style.insetInlineStart).toContain('var(--comp-card-lined-margin-offset');
      expect(line.style.left).toBe('');
      // Behind in-flow children, inside the card's own stacking context.
      expect(line.style.zIndex).toBe('-1');
      expect(line.parentElement?.style.isolation).toBe('isolate');
    });

    it('draws no margin line on sticky or plain', () => {
      const sticky = render(<Card variant="sticky">x</Card>);
      expect(sticky.container.querySelector('[data-card-margin-line]')).toBeNull();
      const plain = render(<Card>x</Card>);
      expect(plain.container.querySelector('[data-card-margin-line]')).toBeNull();
    });

    it('keeps the sketch surface for the default plain variant', () => {
      const { container } = render(<Card>x</Card>);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('renders an unknown variant as plain', () => {
      const { container } = render(
        <Card variant={'foo' as CardVariant} data-testid="c">
          x
        </Card>,
      );
      expect(container.querySelector('svg')).not.toBeNull();
      expect(screen.getByTestId('c').style.backgroundImage).toBe('');
    });

    it('merges consumer style last', () => {
      render(
        <Card variant="sticky" data-testid="c" style={{ marginTop: 8 }}>
          x
        </Card>,
      );
      expect(screen.getByTestId('c')).toHaveStyle({ marginTop: '8px' });
    });
  });
});
