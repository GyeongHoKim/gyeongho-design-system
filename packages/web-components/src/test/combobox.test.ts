import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhCombobox } from '../components/combobox.js';
import { cleanup, mount } from './fixture.js';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

async function mountCombobox(): Promise<GhCombobox> {
  const el = await mount(new GhCombobox());
  el.options = OPTIONS;
  el.label = 'Fruit';
  await el.updateComplete;
  return el;
}

function input(el: GhCombobox): HTMLInputElement {
  return el.shadowRoot?.querySelector('input') as HTMLInputElement;
}

describe('gh-combobox', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-combobox')).toBe(GhCombobox);
  });

  it('exposes combobox semantics', async () => {
    const el = await mountCombobox();
    expect(input(el).getAttribute('role')).toBe('combobox');
    expect(input(el).getAttribute('aria-autocomplete')).toBe('list');
    expect(input(el).getAttribute('aria-expanded')).toBe('false');
  });

  it('filters options as the user types', async () => {
    const el = await mountCombobox();
    const field = input(el);
    field.value = 'ch';
    field.dispatchEvent(new Event('input'));
    await el.updateComplete;
    await el.updateComplete;
    const options = el.shadowRoot
      ?.querySelector('gh-select-listbox')
      ?.shadowRoot?.querySelectorAll('[role="option"]');
    expect(options?.length).toBe(1);
    expect(options?.[0]?.textContent?.trim()).toBe('Cherry');
  });

  it('selects the highlighted option with Enter', async () => {
    const el = await mountCombobox();
    const handler = vi.fn();
    el.addEventListener('change', handler);
    const field = input(el);
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await el.updateComplete;
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await el.updateComplete;
    expect(el.value).toBe('apple');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', async () => {
    const el = await mountCombobox();
    const field = input(el);
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await el.updateComplete;
    expect(el.open).toBe(true);
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await el.updateComplete;
    expect(el.open).toBe(false);
  });
});
