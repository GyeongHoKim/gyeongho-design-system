import { afterEach, describe, expect, it } from 'vitest';
import { GhNavigationMenu } from '../components/navigation-menu.js';
import { cleanup, mount } from './fixture.js';

const ITEMS = [
  { label: 'Home', href: '/' },
  {
    label: 'Products',
    children: [
      { label: 'Web', href: '/web' },
      { label: 'Mobile', href: '/mobile' },
    ],
  },
];

async function mountNav(): Promise<GhNavigationMenu> {
  const el = await mount(new GhNavigationMenu());
  el.items = ITEMS;
  el.label = 'Primary';
  await el.updateComplete;
  return el;
}

describe('gh-navigation-menu', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-navigation-menu')).toBe(GhNavigationMenu);
  });

  it('renders direct links and dropdown triggers', async () => {
    const el = await mountNav();
    expect(el.shadowRoot?.querySelector('nav')?.getAttribute('aria-label')).toBe('Primary');
    expect(el.shadowRoot?.querySelector('a.top')?.getAttribute('href')).toBe('/');
    const trigger = el.shadowRoot?.querySelector('button.top');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('true');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the shared panel with sub-links on trigger click', async () => {
    const el = await mountNav();
    (el.shadowRoot?.querySelector('button.top') as HTMLButtonElement).click();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('button.top')?.getAttribute('aria-expanded')).toBe('true');
    const links = el.shadowRoot?.querySelectorAll('.panel .link');
    expect(links?.length).toBe(2);
    expect(links?.[0]?.getAttribute('href')).toBe('/web');
  });

  describe('current-page highlighting', () => {
    it('marks a standalone link current only on an exact path match', async () => {
      const el = await mountNav();
      el.current = '/';
      await el.updateComplete;
      const home = el.shadowRoot?.querySelector('a.top');
      expect(home?.classList.contains('current')).toBe(true);
      expect(home?.getAttribute('aria-current')).toBe('page');
    });

    it('does not mark a root link current on a descendant page', async () => {
      const el = await mountNav();
      el.current = '/web';
      await el.updateComplete;
      const home = el.shadowRoot?.querySelector('a.top');
      expect(home?.classList.contains('current')).toBe(false);
      expect(home?.getAttribute('aria-current')).toBeNull();
    });

    it('highlights a dropdown group when a child is an ancestor of the current path', async () => {
      const el = await mount(new GhNavigationMenu());
      el.items = [
        { label: 'Home', href: '/' },
        { label: 'Library', children: [{ label: 'Components', href: '/components' }] },
      ];
      el.current = '/components/button';
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('button.top')?.classList.contains('current')).toBe(true);
      // The root link stays un-highlighted even though the path starts with '/'.
      expect(el.shadowRoot?.querySelector('a.top')?.classList.contains('current')).toBe(false);
    });

    it('sets aria-current="page" on a leaf link only on an exact match', async () => {
      const el = await mountNav();
      el.current = '/web';
      await el.updateComplete;
      (el.shadowRoot?.querySelector('button.top') as HTMLButtonElement).click();
      await el.updateComplete;
      const links = el.shadowRoot?.querySelectorAll('.panel .link');
      expect(links?.[0]?.getAttribute('aria-current')).toBe('page'); // /web
      expect(links?.[1]?.getAttribute('aria-current')).toBeNull(); // /mobile
    });

    it('ignores a trailing slash when matching', async () => {
      const el = await mountNav();
      el.current = '/mobile/';
      await el.updateComplete;
      (el.shadowRoot?.querySelector('button.top') as HTMLButtonElement).click();
      await el.updateComplete;
      const links = el.shadowRoot?.querySelectorAll('.panel .link');
      expect(links?.[1]?.getAttribute('aria-current')).toBe('page'); // /mobile matches /mobile/
    });

    it('highlights nothing when current is unset', async () => {
      const el = await mountNav();
      expect(el.shadowRoot?.querySelector('a.top')?.classList.contains('current')).toBe(false);
      expect(el.shadowRoot?.querySelector('button.top')?.classList.contains('current')).toBe(false);
    });
  });
});
