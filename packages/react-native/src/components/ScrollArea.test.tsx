import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { ScrollArea } from './ScrollArea.js';

describe('ScrollArea', () => {
  it('renders its children', () => {
    renderWithTheme(
      <ScrollArea testID="area">
        <Text>Scrollable content</Text>
      </ScrollArea>,
    );
    expect(screen.getByTestId('area')).toBeInTheDocument();
    expect(screen.getByText('Scrollable content')).toBeInTheDocument();
  });

  it('renders the horizontal orientation without error', () => {
    renderWithTheme(
      <ScrollArea orientation="horizontal" testID="horizontal">
        <Text>Wide content</Text>
      </ScrollArea>,
    );
    expect(screen.getByTestId('horizontal')).toBeInTheDocument();
    expect(screen.getByText('Wide content')).toBeInTheDocument();
  });

  it('renders the both orientation without error', () => {
    renderWithTheme(
      <ScrollArea orientation="both" testID="both">
        <Text>Large content</Text>
      </ScrollArea>,
    );
    expect(screen.getByTestId('both')).toBeInTheDocument();
    expect(screen.getByText('Large content')).toBeInTheDocument();
  });

  it('is exposed as a labelled region when an accessibility label is given', () => {
    renderWithTheme(<ScrollArea accessibilityLabel="Log output" testID="labelled" />);
    expect(screen.getByTestId('labelled')).toHaveAttribute('aria-label', 'Log output');
  });
});
