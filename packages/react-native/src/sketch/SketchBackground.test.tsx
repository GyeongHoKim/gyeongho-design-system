import { rectangle } from '@ghds/sketch-core';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SketchBackground } from './SketchBackground.js';

const SIZE = { width: 120, height: 48 };
const drawable = rectangle(2, 2, 116, 44, {
  roughness: 1.4,
  bowing: 2,
  seed: 7,
  fillStyle: 'hachure',
  hachureGap: 8,
  hachureAngle: -41,
});

describe('SketchBackground', () => {
  it('renders nothing before measurement', () => {
    const { container } = render(
      <SketchBackground
        drawable={null}
        size={{ width: 0, height: 0 }}
        strokeColor="#000"
        strokeWidth={2}
      />,
    );
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders one <path> per stroke path in the IR', () => {
    const { container } = render(
      <SketchBackground drawable={drawable} size={SIZE} strokeColor="#111" strokeWidth={2} />,
    );
    expect(container.querySelector('svg')).not.toBeNull();
    const paths = container.querySelectorAll('path');
    // Outline only (no fillColor passed) ⇒ exactly the stroke paths.
    expect(paths.length).toBe(drawable.strokePaths.length);
  });

  it('adds fill paths when a fill color is supplied', () => {
    const { container } = render(
      <SketchBackground
        drawable={drawable}
        size={SIZE}
        strokeColor="#111"
        fillColor="#abc"
        strokeWidth={2}
      />,
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(drawable.strokePaths.length + drawable.fillPaths.length);
  });
});
