import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Progress } from './Progress.js';

describe('Progress', () => {
  it('exposes a determinate progressbar with aria values', () => {
    render(<Progress value={40} label="Upload" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('respects a custom max', () => {
    render(<Progress value={3} max={5} label="Steps" />);
    const bar = screen.getByRole('progressbar', { name: 'Steps' });
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemax', '5');
  });

  it('omits aria-valuenow when indeterminate', () => {
    render(<Progress label="Loading" />);
    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('treats a NaN value as indeterminate (no aria-valuenow)', () => {
    render(<Progress value={Number.NaN} label="Loading" />);
    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('renders sketch rail and fill geometry', () => {
    const { container } = render(<Progress value={50} label="x" />);
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });
});
