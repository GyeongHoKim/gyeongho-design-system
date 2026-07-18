import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Marker } from './Marker.js';

describe('Marker', () => {
  it('renders the highlighted text', () => {
    renderWithTheme(<Marker>important</Marker>);
    expect(screen.getByText('important')).toBeInTheDocument();
  });

  it('exposes a testID handle', () => {
    renderWithTheme(<Marker testID="mark">hi</Marker>);
    expect(screen.getByTestId('mark')).toBeInTheDocument();
  });

  it('renders every variant without error', () => {
    for (const variant of ['default', 'success', 'info', 'danger'] as const) {
      renderWithTheme(
        <Marker variant={variant} testID={`mark-${variant}`}>
          {variant}
        </Marker>,
      );
      expect(screen.getByTestId(`mark-${variant}`)).toBeInTheDocument();
    }
  });
});
