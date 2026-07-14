import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhContextMenu } from '../components/context-menu.js';
import { cleanup, mount } from './fixture.js';

const ITEMS = [
  { value: 'copy', label: 'Copy' },
  { value: 'paste', label: 'Paste' },
  { value: 'delete', label: 'Delete' },
];

async function mountMenu(): Promise<GhContextMenu> {
  const el = await mount(new GhContextMenu());
  el.items = ITEMS;
  el.dangerValues = ['delete'];
  await el.updateComplete;
  return el;
}

describe('gh-context-menu', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-context-menu')).toBe(GhContextMenu);
  });

  it('is collapsed until a contextmenu event', async () => {
    const el = await mountMenu();
    expect(el.shadowRoot?.querySelector('.panel')?.classList.contains('open')).toBe(false);
  });

  it('opens on right-click and renders menuitems', async () => {
    const el = await mountMenu();
    el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: 5, clientY: 5 }));
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.panel')?.classList.contains('open')).toBe(true);
    expect(el.shadowRoot?.querySelectorAll('[role="menuitem"]').length).toBe(3);
  });

  it('dispatches select with the item value and closes', async () => {
    const el = await mountMenu();
    el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: 5, clientY: 5 }));
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('select', handler);
    (el.shadowRoot?.querySelectorAll('[role="menuitem"]')[1] as HTMLElement).click();
    await el.updateComplete;
    expect((handler.mock.calls[0][0] as CustomEvent<string>).detail).toBe('paste');
    expect(el.shadowRoot?.querySelector('.panel')?.classList.contains('open')).toBe(false);
  });
});
