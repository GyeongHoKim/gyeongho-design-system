import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Badge } from './Badge.js';

describe('Badge', () => {
  it('renders its label', () => {
    renderWithTheme(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('exposes a testID handle', () => {
    renderWithTheme(
      <Badge testID="my-badge" variant="success">
        Done
      </Badge>,
    );
    expect(screen.getByTestId('my-badge')).toBeInTheDocument();
  });

  it('renders every variant without error', () => {
    renderWithTheme(
      <>
        <Badge variant="neutral">n</Badge>
        <Badge variant="primary">p</Badge>
        <Badge variant="success">s</Badge>
        <Badge variant="warning">w</Badge>
        <Badge variant="danger">d</Badge>
        <Badge variant="info">i</Badge>
      </>,
    );
    for (const label of ['n', 'p', 's', 'w', 'd', 'i']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('applies an accessibility label when provided', () => {
    renderWithTheme(
      <Badge testID="labelled" variant="danger" accessibilityLabel="3 errors">
        3
      </Badge>,
    );
    expect(screen.getByTestId('labelled')).toHaveAttribute('aria-label', '3 errors');
  });
});
