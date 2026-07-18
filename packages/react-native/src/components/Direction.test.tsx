import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { DirectionProvider, useDirection } from './Direction.js';

function Probe() {
  const dir = useDirection();
  return <Text>dir:{dir}</Text>;
}

describe('Direction', () => {
  it('defaults to ltr when no provider is present (LTR app)', () => {
    renderWithTheme(<Probe />);
    expect(screen.getByText('dir:ltr')).toBeInTheDocument();
  });

  it('propagates an explicit rtl direction from the provider', () => {
    renderWithTheme(
      <DirectionProvider dir="rtl">
        <Probe />
      </DirectionProvider>,
    );
    expect(screen.getByText('dir:rtl')).toBeInTheDocument();
  });

  it('propagates an explicit ltr direction from the provider', () => {
    renderWithTheme(
      <DirectionProvider dir="ltr">
        <Probe />
      </DirectionProvider>,
    );
    expect(screen.getByText('dir:ltr')).toBeInTheDocument();
  });
});
