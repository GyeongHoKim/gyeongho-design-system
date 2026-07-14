import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhCollapsible } from '../components/collapsible.js';
import { cleanup, mount } from './fixture.js';

describe('gh-collapsible', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-collapsible')).toBe(GhCollapsible);
  });

  it('wires aria-expanded and aria-controls', async () => {
    const el = await mount(new GhCollapsible());
    el.label = 'Details';
    await el.updateComplete;
    const header = el.shadowRoot?.querySelector('.header');
    const region = el.shadowRoot?.querySelector('.region');
    expect(header?.getAttribute('aria-expanded')).toBe('false');
    expect(header?.getAttribute('aria-controls')).toBe(region?.id);
    expect(region?.hasAttribute('hidden')).toBe(true);
  });

  it('toggles open on header click and dispatches toggle', async () => {
    const el = await mount(new GhCollapsible());
    const handler = vi.fn();
    el.addEventListener('toggle', handler);
    (el.shadowRoot?.querySelector('.header') as HTMLButtonElement).click();
    await el.updateComplete;
    expect(el.open).toBe(true);
    expect(el.shadowRoot?.querySelector('.region')?.hasAttribute('hidden')).toBe(false);
    expect((handler.mock.calls[0][0] as CustomEvent<boolean>).detail).toBe(true);
  });

  it('does not toggle when disabled', async () => {
    const el = await mount(new GhCollapsible());
    el.disabled = true;
    await el.updateComplete;
    (el.shadowRoot?.querySelector('.header') as HTMLButtonElement).click();
    expect(el.open).toBe(false);
  });
});
