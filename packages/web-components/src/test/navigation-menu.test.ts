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
});
