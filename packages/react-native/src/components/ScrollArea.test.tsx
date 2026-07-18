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

  it('labels the scroll region (not the wrapper) for assistive tech', () => {
    renderWithTheme(<ScrollArea accessibilityLabel="Log output" testID="labelled" />);
    // The label lives on the ScrollView, so AT identifies the scroll region.
    const region = screen.getByLabelText('Log output');
    expect(region).toBeInTheDocument();
    // The wrapper Box keeps only the testID, not the label.
    expect(screen.getByTestId('labelled')).not.toHaveAttribute('aria-label');
  });
});
