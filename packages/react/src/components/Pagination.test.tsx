import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination, paginationRange } from './Pagination.js';

describe('paginationRange', () => {
  it('lists every page when the count fits without an ellipsis', () => {
    expect(paginationRange(5, 3)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange(7, 1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('collapses large gaps to an ellipsis around the current page', () => {
    expect(paginationRange(10, 5)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
  });

  it('fills a single-page gap with the page rather than an ellipsis', () => {
    expect(paginationRange(9, 4)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 9]);
  });

  it('returns an empty list for a non-positive count', () => {
    expect(paginationRange(0, 1)).toEqual([]);
  });
});

describe('Pagination', () => {
  it('exposes a navigation landmark and marks the current page', () => {
    render(<Pagination count={5} page={3} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
  });

  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(<Pagination count={5} page={1} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    rerender(<Pagination count={5} page={5} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('fires onPageChange with the chosen page', async () => {
    const onPageChange = vi.fn();
    render(<Pagination count={5} page={1} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('does not fire when clicking the current page', async () => {
    const onPageChange = vi.fn();
    render(<Pagination count={5} page={2} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
