import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton.js';

describe('Skeleton', () => {
  it('is decorative (aria-hidden)', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders a sketch fill', () => {
    const { container } = render(<Skeleton />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('applies an explicit width and height', () => {
    const { container } = render(<Skeleton width={120} height={12} />);
    expect(container.firstElementChild).toHaveStyle({ width: '120px', height: '12px' });
  });

  it('renders every variant without error', () => {
    const { container } = render(
      <>
        <Skeleton variant="rect" />
        <Skeleton variant="text" />
        <Skeleton variant="circle" />
      </>,
    );
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(3);
  });
});
