import { afterEach, describe, expect, it } from 'vitest';
import { GhSelectListbox, getSelectOptionId } from '../components/select-listbox.js';
import { cleanup, mount } from './fixture.js';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
];

describe('gh-select-listbox', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-select-listbox')).toBe(GhSelectListbox);
  });

  it('reflects `open` as a host attribute (drives the `:host([open])` visibility rule)', async () => {
    const el = new GhSelectListbox();
    el.options = OPTIONS;
    el.hostId = 'gh-select-1';
    await mount(el);
    expect(el.hasAttribute('open')).toBe(false);
    el.open = true;
    await el.updateComplete;
    expect(el.hasAttribute('open')).toBe(true);
  });

  it('renders one row per option with matching ids', async () => {
    const el = new GhSelectListbox();
    el.options = OPTIONS;
    el.hostId = 'gh-select-1';
    await mount(el);
    const rows = el.shadowRoot?.querySelectorAll('[role="option"]');
    expect(rows).toHaveLength(2);
    expect(
      el.shadowRoot?.querySelector(`#${getSelectOptionId('gh-select-1', 'apple')}`),
    ).not.toBeNull();
  });

  it('marks the selected and disabled rows via aria attributes', async () => {
    const el = new GhSelectListbox();
    el.options = OPTIONS;
    el.hostId = 'gh-select-1';
    el.value = 'apple';
    await mount(el);
    const apple = el.shadowRoot?.querySelector(`#${getSelectOptionId('gh-select-1', 'apple')}`);
    const banana = el.shadowRoot?.querySelector(`#${getSelectOptionId('gh-select-1', 'banana')}`);
    expect(apple?.getAttribute('aria-selected')).toBe('true');
    expect(banana?.getAttribute('aria-disabled')).toBe('true');
  });

  it('dispatches option-select only for enabled options', async () => {
    const el = new GhSelectListbox();
    el.options = OPTIONS;
    el.hostId = 'gh-select-1';
    await mount(el);

    let selected: string | undefined;
    el.addEventListener('option-select', (event) => {
      selected = (event as CustomEvent<{ value: string }>).detail.value;
    });

    (
      el.shadowRoot?.querySelector(`#${getSelectOptionId('gh-select-1', 'banana')}`) as HTMLElement
    ).click();
    expect(selected).toBeUndefined();

    (
      el.shadowRoot?.querySelector(`#${getSelectOptionId('gh-select-1', 'apple')}`) as HTMLElement
    ).click();
    expect(selected).toBe('apple');
  });

  it('dispatches option-highlight on mouseenter only for enabled options', async () => {
    const el = new GhSelectListbox();
    el.options = OPTIONS;
    el.hostId = 'gh-select-1';
    await mount(el);

    let highlighted: string | undefined;
    el.addEventListener('option-highlight', (event) => {
      highlighted = (event as CustomEvent<{ value: string }>).detail.value;
    });

    (
      el.shadowRoot?.querySelector(`#${getSelectOptionId('gh-select-1', 'banana')}`) as HTMLElement
    ).dispatchEvent(new Event('mouseenter', { bubbles: true }));
    expect(highlighted).toBeUndefined();

    (
      el.shadowRoot?.querySelector(`#${getSelectOptionId('gh-select-1', 'apple')}`) as HTMLElement
    ).dispatchEvent(new Event('mouseenter', { bubbles: true }));
    expect(highlighted).toBe('apple');
  });

  it('exposes a listbox role via ElementInternals', async () => {
    const el = new GhSelectListbox();
    el.options = OPTIONS;
    el.listboxLabel = 'Fruit';
    await mount(el);
    const internals = (el as unknown as { internals: ElementInternals }).internals;
    expect(internals.role).toBe('listbox');
    expect(internals.ariaLabel).toBe('Fruit');
  });
});
