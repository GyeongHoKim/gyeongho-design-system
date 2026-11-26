import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhToggle } from '../components/toggle.js';
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

  describe('controlled value', () => {
    function toggleAt(el: GhToggleGroup, index: number): GhToggle {
      const toggle = el.shadowRoot?.querySelectorAll('gh-toggle')[index];
      if (!(toggle instanceof GhToggle)) {
        throw new Error(`toggle ${index} not rendered`);
      }
      return toggle;
    }

    function click(toggle: GhToggle): void {
      toggle.shadowRoot?.querySelector('button')?.click();
    }

    it('keeps the pressed item pressed when the handler sets the same value back', async () => {
      const el = await mountGroup('single');
      el.value = ['left'];
      await el.updateComplete;
      el.addEventListener('value-change', () => {
        el.value = ['left'];
      });
      click(toggleAt(el, 0));
      await el.updateComplete;
      expect(el.value).toEqual(['left']);
      expect(toggleAt(el, 0).pressed).toBe(true);
    });

    it('reverts a toggle when the handler does not accept the change', async () => {
      const el = await mountGroup('single');
      el.value = ['left'];
      await el.updateComplete;
      click(toggleAt(el, 1));
      await el.updateComplete;
      expect(toggleAt(el, 0).pressed).toBe(true);
      expect(toggleAt(el, 1).pressed).toBe(false);
    });
  });

  it('wraps horizontal groups and keeps vertical groups in one column', () => {
    const cssText = ([GhToggleGroup.styles] as unknown[])
      .flat(Infinity)
      .map((r) => (r as { cssText: string }).cssText)
      .join('\n');
    expect(cssText).toMatch(/:host\s*\{[^}]*flex-wrap:\s*wrap/);
    expect(cssText).toMatch(/:host\(\[orientation='vertical'\]\)\s*\{[^}]*flex-wrap:\s*nowrap/);
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
