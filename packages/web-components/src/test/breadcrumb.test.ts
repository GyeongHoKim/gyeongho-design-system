import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhBreadcrumb } from '../components/breadcrumb.js';
import { cleanup, mount } from './fixture.js';

const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Library', href: '/library' },
  { label: 'Data' },
];

describe('gh-breadcrumb', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-breadcrumb')).toBe(GhBreadcrumb);
  });

  it('renders a nav landmark with links for all but the last item', async () => {
    const el = await mount(new GhBreadcrumb());
    el.items = ITEMS;
    await el.updateComplete;
    const nav = el.shadowRoot?.querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(el.shadowRoot?.querySelectorAll('a').length).toBe(2);
  });

  it('marks the last item as the current page', async () => {
    const el = await mount(new GhBreadcrumb());
    el.items = ITEMS;
    await el.updateComplete;
    const current = el.shadowRoot?.querySelector('.current');
    expect(current?.getAttribute('aria-current')).toBe('page');
    expect(current?.textContent).toBe('Data');
  });

  it('dispatches a select event when a link is clicked', async () => {
    const el = await mount(new GhBreadcrumb());
    el.items = ITEMS;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('select', handler);
    el.shadowRoot?.querySelectorAll('a')[1]?.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ item: ITEMS[1], index: 1 });
  });
});
