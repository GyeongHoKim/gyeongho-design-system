import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Skeleton } from './Skeleton.js';

describe('Skeleton', () => {
  it('is hidden from assistive tech', () => {
    renderWithTheme(<Skeleton testID="sk" />);
    expect(screen.getByTestId('sk')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders every variant without error', () => {
    renderWithTheme(
      <>
        <Skeleton variant="rect" testID="rect" />
        <Skeleton variant="text" testID="text" />
        <Skeleton variant="circle" testID="circle" />
      </>,
    );
    for (const id of ['rect', 'text', 'circle']) {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    }
  });
});
