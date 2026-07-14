import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhSidebar } from '../components/sidebar.js';
import { cleanup, mount } from './fixture.js';

describe('gh-sidebar', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-sidebar')).toBe(GhSidebar);
  });

  it('renders a labelled nav with header/content/footer slots', async () => {
    const el = await mount(new GhSidebar());
    el.label = 'Main';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('nav')?.getAttribute('aria-label')).toBe('Main');
    expect(el.shadowRoot?.querySelector('slot[name="header"]')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('slot[name="footer"]')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('.content slot:not([name])')).not.toBeNull();
  });

  it('toggles collapsed state and dispatches toggle', async () => {
    const el = await mount(new GhSidebar());
    const handler = vi.fn();
    el.addEventListener('toggle', handler);
    const toggle = el.shadowRoot?.querySelector('.toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    await el.updateComplete;
    expect(el.collapsed).toBe(true);
    expect(el.hasAttribute('collapsed')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect((handler.mock.calls[0][0] as CustomEvent<boolean>).detail).toBe(true);
  });
});
