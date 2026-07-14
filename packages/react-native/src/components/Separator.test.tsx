import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Separator } from './Separator.js';

describe('Separator', () => {
  it('renders a horizontal divider by default', () => {
    renderWithTheme(<Separator testID="sep" />);
    expect(screen.getByTestId('sep')).toBeInTheDocument();
  });

  it('renders a vertical divider', () => {
    renderWithTheme(<Separator orientation="vertical" testID="sep" />);
    expect(screen.getByTestId('sep')).toBeInTheDocument();
  });

  it('renders a non-decorative divider in dark theme', () => {
    renderWithTheme(<Separator decorative={false} testID="sep" />, darkTheme);
    expect(screen.getByTestId('sep')).toBeInTheDocument();
  });
});
