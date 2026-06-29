import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { Card } from './Card.js';

describe('Card', () => {
  it('renders its children', () => {
    renderWithTheme(
      <Card>
        <Text>Card body</Text>
      </Card>,
    );
    expect(screen.getByText('Card body')).toBeInTheDocument();
  });

  it('exposes a testID handle', () => {
    renderWithTheme(<Card testID="my-card" />);
    expect(screen.getByTestId('my-card')).toBeInTheDocument();
  });

  it('renders the elevated variant without error', () => {
    renderWithTheme(
      <Card elevated testID="raised">
        <Text>Raised</Text>
      </Card>,
    );
    expect(screen.getByTestId('raised')).toBeInTheDocument();
    expect(screen.getByText('Raised')).toBeInTheDocument();
  });

  it('is exposed as a labelled region when an accessibility label is given', () => {
    renderWithTheme(<Card accessibilityLabel="Summary card" testID="labelled" />);
    expect(screen.getByTestId('labelled')).toHaveAttribute('aria-label', 'Summary card');
  });
});
