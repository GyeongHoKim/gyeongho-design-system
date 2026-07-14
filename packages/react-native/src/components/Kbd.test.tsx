import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Kbd } from './Kbd.js';

describe('Kbd', () => {
  it('renders the key label', () => {
    renderWithTheme(<Kbd>Ctrl</Kbd>);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
  });

  it('exposes a testID handle in dark theme', () => {
    renderWithTheme(<Kbd testID="kbd">Enter</Kbd>, darkTheme);
    expect(screen.getByTestId('kbd')).toBeInTheDocument();
    expect(screen.getByText('Enter')).toBeInTheDocument();
  });
});
