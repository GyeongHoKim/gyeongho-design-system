import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '../test-utils.js';
import { Pagination, paginationRange } from './Pagination.js';

describe('paginationRange (RN)', () => {
  it('lists every page when the count fits', () => {
    expect(paginationRange(5, 3)).toEqual([1, 2, 3, 4, 5]);
  });
  it('collapses large gaps to an ellipsis', () => {
    expect(paginationRange(10, 5)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
  });
});

describe('Pagination', () => {
  it('exposes a navigation landmark with the label', () => {
    renderWithTheme(<Pagination count={5} page={2} testID="pg" />);
    expect(screen.getByTestId('pg')).toHaveAttribute('aria-label', 'Pagination');
  });

  it('renders a labelled button per page', () => {
    renderWithTheme(<Pagination count={5} page={2} />);
    expect(screen.getByLabelText('Page 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });

  it('fires onPageChange with the chosen page', () => {
    const onPageChange = vi.fn();
    renderWithTheme(<Pagination count={5} page={1} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByLabelText('Page 3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
