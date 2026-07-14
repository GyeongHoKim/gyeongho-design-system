import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GhMenubarSelectDetail } from '../components/menubar.js';
import { GhMenubar } from '../components/menubar.js';
import { cleanup, mount } from './fixture.js';

const MENUS = [
  {
    label: 'File',
    items: [
      { value: 'new', label: 'New' },
      { value: 'open', label: 'Open' },
    ],
  },
  { label: 'Edit', items: [{ value: 'undo', label: 'Undo' }] },
];

async function mountBar(): Promise<GhMenubar> {
  const el = await mount(new GhMenubar());
  el.menus = MENUS;
  el.label = 'Main';
  await el.updateComplete;
  return el;
}

describe('gh-menubar', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-menubar')).toBe(GhMenubar);
  });

  it('exposes menubar semantics and renders a menu per entry', async () => {
    const el = await mountBar();
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.role).toBe('menubar');
    expect(el.shadowRoot?.querySelectorAll('gh-menu').length).toBe(2);
  });

  it('re-emits child selections as menu-select', async () => {
    const el = await mountBar();
    const handler = vi.fn();
    el.addEventListener('menu-select', handler);
    const firstMenu = el.shadowRoot?.querySelector('gh-menu');
    firstMenu?.dispatchEvent(
      new CustomEvent('select', { detail: 'open', bubbles: true, composed: true }),
    );
    await el.updateComplete;
    const detail = (handler.mock.calls[0][0] as CustomEvent<GhMenubarSelectDetail>).detail;
    expect(detail).toEqual({ menu: 'File', value: 'open' });
  });
});
