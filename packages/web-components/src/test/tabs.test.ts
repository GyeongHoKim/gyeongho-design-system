import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GhTab } from '../components/tab.js';
import { GhTabs } from '../components/tabs.js';
import { cleanup, mount } from './fixture.js';

const ITEMS = [
  { value: 'a', label: 'First', content: 'First panel' },
  { value: 'b', label: 'Second', content: 'Second panel' },
  { value: 'c', label: 'Third', content: 'Third panel' },
];

async function mountTabs(): Promise<GhTabs> {
  const el = await mount(new GhTabs());
  el.items = ITEMS;
  await el.updateComplete;
  // Wait for child gh-tab elements to render.
  await Promise.all(
    [...(el.shadowRoot?.querySelectorAll('gh-tab') ?? [])].map((t) => (t as GhTab).updateComplete),
  );
  return el;
}

describe('gh-tabs', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-tabs')).toBe(GhTabs);
  });

  it('renders a tablist and selects the first tab by default', async () => {
    const el = await mountTabs();
    expect(el.shadowRoot?.querySelector('[role="tablist"]')).not.toBeNull();
    const tabs = el.shadowRoot?.querySelectorAll('gh-tab');
    expect(tabs?.length).toBe(3);
    expect((tabs?.[0] as GhTab).selected).toBe(true);
  });

  it('shows only the active panel', async () => {
    const el = await mountTabs();
    const panels = el.shadowRoot?.querySelectorAll('[role="tabpanel"]');
    expect((panels?.[0] as HTMLElement).hasAttribute('hidden')).toBe(false);
    expect((panels?.[1] as HTMLElement).hasAttribute('hidden')).toBe(true);
  });

  it('dispatches value-change when a tab is selected', async () => {
    const el = await mountTabs();
    const handler = vi.fn();
    el.addEventListener('value-change', handler);
    const secondBtn = (
      el.shadowRoot?.querySelectorAll('gh-tab')[1] as GhTab
    ).shadowRoot?.querySelector('button');
    secondBtn?.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent<string>).detail).toBe('b');
  });

  it('moves selection with ArrowRight', async () => {
    const el = await mountTabs();
    const tablist = el.shadowRoot?.querySelector('.tablist');
    tablist?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await el.updateComplete;
    const tabs = el.shadowRoot?.querySelectorAll('gh-tab');
    expect((tabs?.[1] as GhTab).selected).toBe(true);
  });
});
