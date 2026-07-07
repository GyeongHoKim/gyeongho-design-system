import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Spinner } from './Spinner.js';

describe('Spinner', () => {
  it('applies a default accessibility label and status role', () => {
    renderWithTheme(<Spinner testID="s" />);
    const el = screen.getByTestId('s');
    expect(el).toHaveAttribute('aria-label', 'Loading');
    expect(el).toHaveAttribute('role', 'status');
  });

  it('accepts a custom label', () => {
    renderWithTheme(<Spinner testID="s" label="Saving" />);
    expect(screen.getByTestId('s')).toHaveAttribute('aria-label', 'Saving');
  });

  it('renders every size without error', () => {
    renderWithTheme(
      <>
        <Spinner size="sm" testID="sm" />
        <Spinner size="md" testID="md" />
        <Spinner size="lg" testID="lg" />
      </>,
    );
    for (const id of ['sm', 'md', 'lg']) {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    }
  });
});
