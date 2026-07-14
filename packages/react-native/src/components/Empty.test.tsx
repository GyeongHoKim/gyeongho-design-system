import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { Empty } from './Empty.js';

describe('Empty', () => {
  it('renders the title', () => {
    renderWithTheme(<Empty title="No results" />);
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('renders an icon, description and action', () => {
    renderWithTheme(
      <Empty icon="search" title="No results" description="Try another search" testID="empty">
        <Text>Retry</Text>
      </Empty>,
    );
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.getByText('Try another search')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders in dark theme', () => {
    renderWithTheme(<Empty title="Nothing here" testID="empty" />, darkTheme);
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });
});
