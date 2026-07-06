import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhAccordion } from '../components/accordion.js';
import type { GhAccordionItem } from '../components/accordion-item.js';
import { cleanup, mount } from './fixture.js';

const ITEMS = [
  { value: 'a', label: 'Section A', content: 'Body A' },
  { value: 'b', label: 'Section B', content: 'Body B' },
];

async function mountAccordion(
  props: Partial<Pick<GhAccordion, 'type' | 'value'>> = {},
): Promise<GhAccordion> {
  const el = await mount(new GhAccordion());
  el.items = ITEMS;
  if (props.type) {
    el.type = props.type;
  }
  if (props.value) {
    el.value = props.value;
  }
  await el.updateComplete;
  await Promise.all(
    [...(el.shadowRoot?.querySelectorAll('gh-accordion-item') ?? [])].map(
      (i) => (i as GhAccordionItem).updateComplete,
    ),
  );
  return el;
}

describe('gh-accordion', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-accordion')).toBe(GhAccordion);
  });

  it('renders collapsed items by default', async () => {
    const el = await mountAccordion();
    const items = el.shadowRoot?.querySelectorAll('gh-accordion-item');
    expect(items?.length).toBe(2);
    expect((items?.[0] as GhAccordionItem).open).toBe(false);
  });

  it('dispatches value-change with the open set on toggle', async () => {
    const el = await mountAccordion();
    const handler = vi.fn();
    el.addEventListener('value-change', handler);
    const firstHeader = (
      el.shadowRoot?.querySelectorAll('gh-accordion-item')[0] as GhAccordionItem
    ).shadowRoot?.querySelector('button');
    firstHeader?.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent<string[]>).detail).toEqual(['a']);
  });

  it('keeps at most one open in single mode', async () => {
    const el = await mountAccordion({ type: 'single', value: ['a'] });
    // Controlled: toggling B should request [b] (single replaces).
    const handler = vi.fn();
    el.addEventListener('value-change', handler);
    const secondHeader = (
      el.shadowRoot?.querySelectorAll('gh-accordion-item')[1] as GhAccordionItem
    ).shadowRoot?.querySelector('button');
    secondHeader?.click();
    expect((handler.mock.calls[0][0] as CustomEvent<string[]>).detail).toEqual(['b']);
  });

  it('adds to the open set in multiple mode', async () => {
    const el = await mountAccordion({ type: 'multiple', value: ['a'] });
    const handler = vi.fn();
    el.addEventListener('value-change', handler);
    const secondHeader = (
      el.shadowRoot?.querySelectorAll('gh-accordion-item')[1] as GhAccordionItem
    ).shadowRoot?.querySelector('button');
    secondHeader?.click();
    expect((handler.mock.calls[0][0] as CustomEvent<string[]>).detail).toEqual(['a', 'b']);
  });
});
