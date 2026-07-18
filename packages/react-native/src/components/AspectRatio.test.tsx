import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { AspectRatio } from './AspectRatio.js';

describe('AspectRatio', () => {
  it('renders its children', () => {
    renderWithTheme(
      <AspectRatio>
        <Text>Framed content</Text>
      </AspectRatio>,
    );
    expect(screen.getByText('Framed content')).toBeInTheDocument();
  });

  it('exposes a testID handle', () => {
    renderWithTheme(<AspectRatio testID="ratio-box" ratio={16 / 9} />);
    expect(screen.getByTestId('ratio-box')).toBeInTheDocument();
  });

  it('renders a custom ratio without error', () => {
    renderWithTheme(
      <AspectRatio ratio={4 / 3} testID="four-three">
        <Text>4:3</Text>
      </AspectRatio>,
    );
    expect(screen.getByTestId('four-three')).toBeInTheDocument();
    expect(screen.getByText('4:3')).toBeInTheDocument();
  });

  it('is exposed as a labelled region when an accessibility label is given', () => {
    renderWithTheme(<AspectRatio accessibilityLabel="Cover image" testID="labelled" />);
    expect(screen.getByTestId('labelled')).toHaveAttribute('aria-label', 'Cover image');
  });
});
