import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhToggleGroup } from '../components/toggle-group.js';
import { cleanup, mount } from './fixture.js';

const ITEMS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

async function mountGroup(type: 'single' | 'multiple'): Promise<GhToggleGroup> {
  const el = await mount(new GhToggleGroup());
  el.items = ITEMS;
  el.type = type;
  el.label = 'Alignment';
  await el.updateComplete;
  return el;
}

describe('gh-toggle-group', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-toggle-group')).toBe(GhToggleGroup);
  });

  it('exposes group semantics and renders a toggle per item', async () => {
    const el = await mountGroup('single');
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.role).toBe('group');
    expect(el.shadowRoot?.querySelectorAll('gh-toggle').length).toBe(3);
  });

  it('single mode keeps at most one pressed', async () => {
    const el = await mountGroup('single');
    const handler = vi.fn();
    el.addEventListener('value-change', handler);
    const toggles = el.shadowRoot?.querySelectorAll('gh-toggle');
    (toggles?.[0] as HTMLElement).shadowRoot?.querySelector('button')?.click();
    await el.updateComplete;
    expect((handler.mock.calls.at(-1)?.[0] as CustomEvent<string[]>).detail).toEqual(['left']);
    (toggles?.[1] as HTMLElement).shadowRoot?.querySelector('button')?.click();
    await el.updateComplete;
    expect((handler.mock.calls.at(-1)?.[0] as CustomEvent<string[]>).detail).toEqual(['center']);
  });

  it('multiple mode accumulates values', async () => {
    const el = await mountGroup('multiple');
    const handler = vi.fn();
    el.addEventListener('value-change', handler);
    const toggles = el.shadowRoot?.querySelectorAll('gh-toggle');
    (toggles?.[0] as HTMLElement).shadowRoot?.querySelector('button')?.click();
    await el.updateComplete;
    (toggles?.[2] as HTMLElement).shadowRoot?.querySelector('button')?.click();
    await el.updateComplete;
    expect((handler.mock.calls.at(-1)?.[0] as CustomEvent<string[]>).detail).toEqual([
      'left',
      'right',
    ]);
  });
});
