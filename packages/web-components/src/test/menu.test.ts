import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhMenu } from '../components/menu.js';
import { cleanup, mount } from './fixture.js';

const ITEMS = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'delete', label: 'Delete' },
];

async function mountMenu(): Promise<GhMenu> {
  const el = await mount(new GhMenu());
  el.items = ITEMS;
  el.label = 'Actions';
  await el.updateComplete;
  return el;
}

describe('gh-menu', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-menu')).toBe(GhMenu);
  });

  it('renders a collapsed trigger with menu semantics', async () => {
    const el = await mountMenu();
    const trigger = el.shadowRoot?.querySelector('.trigger');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens on click and renders menuitems', async () => {
    const el = await mountMenu();
    (el.shadowRoot?.querySelector('.trigger') as HTMLButtonElement).click();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.trigger')?.getAttribute('aria-expanded')).toBe('true');
    expect(el.shadowRoot?.querySelectorAll('[role="menuitem"]').length).toBe(3);
  });

  it('dispatches select with the item value and closes', async () => {
    const el = await mountMenu();
    (el.shadowRoot?.querySelector('.trigger') as HTMLButtonElement).click();
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('select', handler);
    (el.shadowRoot?.querySelectorAll('[role="menuitem"]')[1] as HTMLElement).click();
    await el.updateComplete;
    expect((handler.mock.calls[0][0] as CustomEvent<string>).detail).toBe('duplicate');
    expect(el.shadowRoot?.querySelector('.trigger')?.getAttribute('aria-expanded')).toBe('false');
  });
});
