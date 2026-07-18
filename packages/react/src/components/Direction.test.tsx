import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DirectionProvider, useDirection } from './Direction.js';

function Probe() {
  return <span data-testid="dir">{useDirection()}</span>;
}

describe('Direction', () => {
  it('defaults to ltr when no provider is present', () => {
    render(<Probe />);
    expect(screen.getByTestId('dir')).toHaveTextContent('ltr');
  });

  it('propagates the provided direction to descendants', () => {
    render(
      <DirectionProvider dir="rtl">
        <Probe />
      </DirectionProvider>,
    );
    expect(screen.getByTestId('dir')).toHaveTextContent('rtl');
  });

  it('reflects the nearest provider when nested', () => {
    render(
      <DirectionProvider dir="rtl">
        <DirectionProvider dir="ltr">
          <Probe />
        </DirectionProvider>
      </DirectionProvider>,
    );
    expect(screen.getByTestId('dir')).toHaveTextContent('ltr');
  });
});
