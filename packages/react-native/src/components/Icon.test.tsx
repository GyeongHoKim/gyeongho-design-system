import { iconNames } from '@ghds/icons';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Icon } from './Icon.js';

describe('Icon', () => {
  it('renders an svg with sketch path geometry', () => {
    const { container } = renderWithTheme(<Icon name="check" />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('sizes the svg from the icon-size token (lg → 32)', () => {
    const { container } = renderWithTheme(<Icon name="home" size="lg" />);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('32');
  });

  it('renders identical geometry for the same icon (deterministic seed)', () => {
    const a = renderWithTheme(<Icon name="star" />).container.querySelector('svg')?.innerHTML;
    const b = renderWithTheme(<Icon name="star" />).container.querySelector('svg')?.innerHTML;
    expect(a).toBe(b);
  });

  it('renders every icon in the set without error', () => {
    for (const name of iconNames) {
      const { container, unmount } = renderWithTheme(<Icon name={name} />);
      expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
      unmount();
    }
  });
});
