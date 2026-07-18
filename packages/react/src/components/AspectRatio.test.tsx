import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AspectRatio } from './AspectRatio.js';

describe('AspectRatio', () => {
  it('renders its children', () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <img src="/x.png" alt="preview" />
      </AspectRatio>,
    );
    expect(screen.getByRole('img', { name: 'preview' })).toBeInTheDocument();
  });

  it('applies the requested ratio via the CSS aspect-ratio property', () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <span>x</span>
      </AspectRatio>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveStyle({ aspectRatio: String(16 / 9) });
  });

  it('defaults to a square (ratio 1)', () => {
    const { container } = render(<AspectRatio>x</AspectRatio>);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveStyle({ aspectRatio: '1' });
  });

  it('forwards arbitrary props such as role to the root element', () => {
    render(
      <AspectRatio role="img" aria-label="chart">
        x
      </AspectRatio>,
    );
    expect(screen.getByRole('img', { name: 'chart' })).toBeInTheDocument();
  });
});
