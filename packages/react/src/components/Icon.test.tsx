import { iconNames } from '@ghds/icons';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from './Icon.js';

describe('Icon', () => {
  it('renders a decorative sketch icon (aria-hidden) by default', () => {
    const { container } = render(<Icon name="check" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
  });

  it('exposes an accessible name when label is given', () => {
    const { getByRole } = render(<Icon name="trash" label="Delete" />);
    const img = getByRole('img', { name: 'Delete' });
    expect(img.tagName.toLowerCase()).toBe('svg');
  });

  it('maps the size prop to a sys.icon.size token', () => {
    const { container } = render(<Icon name="home" size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32px');
    expect(svg).toHaveAttribute('height', '32px');
  });

  it('is deterministic: same icon renders identical geometry across mounts', () => {
    const a = render(<Icon name="star" />).container.querySelector('svg')?.innerHTML;
    const b = render(<Icon name="star" />).container.querySelector('svg')?.innerHTML;
    expect(a).toBe(b);
  });

  it('can render every icon in the set without error', () => {
    for (const name of iconNames) {
      const { container } = render(<Icon name={name} />);
      expect(container.querySelectorAll('svg path').length).toBeGreaterThan(0);
    }
  });
});
