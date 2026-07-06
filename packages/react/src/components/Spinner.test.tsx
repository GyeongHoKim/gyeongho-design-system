import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './Spinner.js';

describe('Spinner', () => {
  it('exposes a status role with a default label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('accepts a custom label', () => {
    render(<Spinner label="Saving changes" />);
    expect(screen.getByRole('status', { name: 'Saving changes' })).toBeInTheDocument();
  });

  it('renders a decorative sketch ellipse outline', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('renders every size without error', () => {
    render(
      <>
        <Spinner size="sm" label="a" />
        <Spinner size="md" label="b" />
        <Spinner size="lg" label="c" />
      </>,
    );
    expect(screen.getByRole('status', { name: 'a' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'c' })).toBeInTheDocument();
  });
});
