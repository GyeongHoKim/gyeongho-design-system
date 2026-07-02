import { iconNames } from '@ghds/icons';
import { afterEach, describe, expect, it } from 'vitest';
import { GhIcon } from '../components/icon.js';
import { cleanup, mount } from './fixture.js';

function paths(el: GhIcon): NodeListOf<SVGPathElement> {
  return el.shadowRoot?.querySelectorAll('path') ?? ([] as unknown as NodeListOf<SVGPathElement>);
}

describe('gh-icon', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-icon')).toBe(GhIcon);
  });

  it('renders sketch <path> geometry for a named icon', async () => {
    const el = new GhIcon();
    el.name = 'check';
    await mount(el);
    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(paths(el).length).toBeGreaterThan(0);
  });

  it('is decorative (aria-hidden) without a label', async () => {
    const el = new GhIcon();
    el.name = 'trash';
    await mount(el);
    expect(el.shadowRoot?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('exposes an accessible image role + label when labelled', async () => {
    const el = new GhIcon();
    el.name = 'trash';
    el.label = 'Delete';
    await mount(el);
    const svg = el.shadowRoot?.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Delete');
    expect(el.shadowRoot?.querySelector('title')?.textContent).toBe('Delete');
  });

  it('reflects the size attribute for token-driven sizing', async () => {
    const el = new GhIcon();
    el.name = 'home';
    el.size = 'lg';
    await mount(el);
    expect(el.getAttribute('size')).toBe('lg');
  });

  it('renders every icon in the set without error', async () => {
    for (const name of iconNames) {
      const el = new GhIcon();
      el.name = name;
      await mount(el);
      expect(paths(el).length).toBeGreaterThan(0);
      el.remove();
    }
  });

  it('is theme-invariant: identical geometry in light and dark schemes', async () => {
    // Icon colour comes from `currentColor` (a `sys.color.icon` CSS var), so only
    // the colour re-themes — the sketched geometry must be byte-identical, and an
    // icon never re-rolls its look when the ancestor `data-theme` flips.
    const light = new GhIcon();
    light.name = 'star';
    document.documentElement.setAttribute('data-theme', 'light');
    await mount(light);
    const lightGeometry = Array.from(paths(light), (p) => p.getAttribute('d'));

    const dark = new GhIcon();
    dark.name = 'star';
    document.documentElement.setAttribute('data-theme', 'dark');
    await mount(dark);
    const darkGeometry = Array.from(paths(dark), (p) => p.getAttribute('d'));

    document.documentElement.removeAttribute('data-theme');
    expect(darkGeometry).toEqual(lightGeometry);
    expect(lightGeometry.length).toBeGreaterThan(0);
  });
});
