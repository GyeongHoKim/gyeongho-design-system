import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Progress } from './Progress.js';

describe('Progress', () => {
  it('exposes a progressbar role with a label', () => {
    renderWithTheme(<Progress value={40} label="Upload" testID="p" />);
    const bar = screen.getByTestId('p');
    expect(bar).toHaveAttribute('role', 'progressbar');
    expect(bar).toHaveAttribute('aria-label', 'Upload');
    // Flat aria-value* props are what react-native-web actually forwards.
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders determinate and indeterminate without error', () => {
    renderWithTheme(
      <>
        <Progress value={0} label="empty" testID="empty" />
        <Progress value={100} label="full" testID="full" />
        <Progress label="loading" testID="indet" />
      </>,
    );
    for (const id of ['empty', 'full', 'indet']) {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    }
  });
});
