import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhSelect } from '../components/select.js';
import type { GhSelectListbox } from '../components/select-listbox.js';
import '../components/select-listbox.js';
import { cleanup, mount } from './fixture.js';

const FRUIT_OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

async function mountSelect(): Promise<GhSelect> {
  const el = new GhSelect();
  el.label = 'Fruit';
  el.placeholder = 'Choose a fruit';
  el.options = FRUIT_OPTIONS;
  return mount(el);
}

function trigger(el: GhSelect): HTMLButtonElement {
  const button = el.shadowRoot?.querySelector('button');
  if (!button) {
    throw new Error('trigger not rendered');
  }
  return button;
}

function pressKey(el: HTMLElement, key: string): void {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));
}

// `aria-activedescendant` can't be a string ID here (it would need to resolve
// into `gh-select-listbox`'s own, separate shadow root) — the trigger gets the
// actual option element via the reflected `ariaActiveDescendantElement`
// property instead. `updateActiveDescendant()` runs fire-and-forget from
// `updated()`, awaiting the listbox's own `updateComplete`; awaiting the same
// promise here (registered after, so it resolves after that continuation runs)
// lets the assignment land before asserting.
async function activeDescendantId(el: GhSelect): Promise<string | null> {
  const listbox = el.shadowRoot?.querySelector<GhSelectListbox>('gh-select-listbox');
  await listbox?.updateComplete;
  const target = (trigger(el) as unknown as { ariaActiveDescendantElement: Element | null })
    .ariaActiveDescendantElement;
  return target?.id ?? null;
}

describe('gh-select', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-select')).toBe(GhSelect);
  });

  it('renders a native button trigger', async () => {
    const el = await mountSelect();
    expect(trigger(el).tagName).toBe('BUTTON');
  });

  it('shows the placeholder when nothing is selected', async () => {
    const el = await mountSelect();
    expect(trigger(el).textContent).toContain('Choose a fruit');
  });

  it('associates a visible label with the trigger', async () => {
    const el = await mountSelect();
    const label = el.shadowRoot?.querySelector('label');
    expect(label?.textContent).toBe('Fruit');
    expect(trigger(el).getAttribute('aria-labelledby')).toBe(label?.id);
  });

  it('opens the listbox on click and closes on option click, dispatching change', async () => {
    const el = await mountSelect();
    const onChange = vi.fn();
    el.addEventListener('change', onChange);

    trigger(el).click();
    await el.updateComplete;
    expect(trigger(el).getAttribute('aria-expanded')).toBe('true');

    const listbox = el.shadowRoot?.querySelector('gh-select-listbox');
    const bananaOption = listbox?.shadowRoot?.querySelector(
      '[id$="-option-banana"]',
    ) as HTMLElement;
    bananaOption.click();
    await el.updateComplete;

    expect(el.value).toBe('banana');
    expect(onChange).toHaveBeenCalled();
    expect(trigger(el).getAttribute('aria-expanded')).toBe('false');
    expect(trigger(el).textContent).toContain('Banana');
  });

  it('ignores clicks on a disabled option', async () => {
    const el = await mountSelect();
    trigger(el).click();
    await el.updateComplete;
    const listbox = el.shadowRoot?.querySelector('gh-select-listbox');
    const cherryOption = listbox?.shadowRoot?.querySelector(
      '[id$="-option-cherry"]',
    ) as HTMLElement;
    cherryOption.click();
    await el.updateComplete;
    expect(el.value).toBe('');
    expect(trigger(el).getAttribute('aria-expanded')).toBe('true');
  });

  it('is form-associated and reflects the selected value as a form attribute', async () => {
    const form = document.createElement('form');
    const el = new GhSelect();
    el.name = 'fruit';
    el.options = FRUIT_OPTIONS;
    form.append(el);
    document.body.append(form);
    await el.updateComplete;
    expect(el.form).toBe(form);

    el.value = 'apple';
    await el.updateComplete;
    expect(el.getAttribute('value')).toBe('apple');
  });

  it('restores its authored default value via the form reset callback', async () => {
    const el = new GhSelect();
    el.value = 'apple';
    el.options = FRUIT_OPTIONS;
    await mount(el);
    el.value = 'banana';
    await el.updateComplete;
    el.formResetCallback();
    await el.updateComplete;
    expect(el.value).toBe('apple');
  });

  it('mirrors the form-disabled callback to the disabled property', async () => {
    const el = await mountSelect();
    el.formDisabledCallback(true);
    await el.updateComplete;
    expect(el.disabled).toBe(true);
  });

  it('opens and highlights the first option on ArrowDown, then moves the highlight', async () => {
    const el = await mountSelect();
    const t = trigger(el);
    pressKey(t, 'ArrowDown');
    await el.updateComplete;
    expect(await activeDescendantId(el)).toContain('option-apple');

    pressKey(t, 'ArrowDown');
    await el.updateComplete;
    expect(await activeDescendantId(el)).toContain('option-banana');
  });

  it('skips disabled options when moving the highlight', async () => {
    const el = await mountSelect();
    const t = trigger(el);
    pressKey(t, 'ArrowDown');
    pressKey(t, 'ArrowDown');
    pressKey(t, 'ArrowDown');
    await el.updateComplete;
    expect(await activeDescendantId(el)).toContain('option-date');
  });

  it('jumps to the first/last enabled option on Home/End', async () => {
    const el = await mountSelect();
    const t = trigger(el);
    pressKey(t, 'ArrowDown');
    pressKey(t, 'End');
    await el.updateComplete;
    expect(await activeDescendantId(el)).toContain('option-date');

    pressKey(t, 'Home');
    await el.updateComplete;
    expect(await activeDescendantId(el)).toContain('option-apple');
  });

  it('selects the highlighted option on Enter and closes the panel', async () => {
    const el = await mountSelect();
    const t = trigger(el);
    pressKey(t, 'ArrowDown');
    pressKey(t, 'ArrowDown');
    pressKey(t, 'Enter');
    await el.updateComplete;
    expect(el.value).toBe('banana');
    expect(t.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape without selecting', async () => {
    const el = await mountSelect();
    const t = trigger(el);
    pressKey(t, 'ArrowDown');
    pressKey(t, 'Escape');
    await el.updateComplete;
    expect(el.value).toBe('');
    expect(t.getAttribute('aria-expanded')).toBe('false');
  });

  it('jumps to a matching option via typeahead', async () => {
    const el = await mountSelect();
    const t = trigger(el);
    pressKey(t, 'ArrowDown');
    pressKey(t, 'd');
    pressKey(t, 'a');
    await el.updateComplete;
    expect(await activeDescendantId(el)).toContain('option-date');
  });

  it('closes when clicking outside the trigger and panel', async () => {
    const el = await mountSelect();
    const outside = document.createElement('button');
    document.body.append(outside);
    trigger(el).click();
    await el.updateComplete;
    expect(trigger(el).getAttribute('aria-expanded')).toBe('true');

    outside.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(trigger(el).getAttribute('aria-expanded')).toBe('false');
  });

  it('does not open when disabled', async () => {
    const el = await mountSelect();
    el.disabled = true;
    await el.updateComplete;
    trigger(el).click();
    await el.updateComplete;
    expect(trigger(el).getAttribute('aria-expanded')).toBe('false');
  });
});
