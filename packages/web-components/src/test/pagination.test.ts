import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhPagination, paginationRange } from '../components/pagination.js';
import { cleanup, mount } from './fixture.js';

describe('paginationRange', () => {
  it('lists every page when the count fits', () => {
    expect(paginationRange(5, 3)).toEqual([1, 2, 3, 4, 5]);
  });
  it('collapses large gaps to an ellipsis', () => {
    expect(paginationRange(10, 5)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
  });
});

describe('gh-pagination', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-pagination')).toBe(GhPagination);
  });

  it('renders prev, page items, and next as a nav landmark', async () => {
    const el = await mount(new GhPagination());
    el.count = 5;
    el.page = 2;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('nav')?.getAttribute('aria-label')).toBe('Pagination');
    // 5 pages + prev + next
    expect(el.shadowRoot?.querySelectorAll('gh-pagination-item').length).toBe(7);
  });

  it('marks the current page item as selected', async () => {
    const el = await mount(new GhPagination());
    el.count = 5;
    el.page = 3;
    await el.updateComplete;
    const selected = el.shadowRoot?.querySelectorAll('gh-pagination-item[selected]');
    expect(selected?.length).toBe(1);
  });

  it('dispatches page-change with the chosen page', async () => {
    const el = await mount(new GhPagination());
    el.count = 5;
    el.page = 1;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('page-change', handler);
    // Third page item (index 2 → page 3).
    const items = el.shadowRoot?.querySelectorAll('gh-pagination-item');
    (items?.[3] as HTMLElement | undefined)?.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent<number>).detail).toBe(3);
  });
});
