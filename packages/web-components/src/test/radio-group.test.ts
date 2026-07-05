import { afterEach, describe, expect, it } from 'vitest';
import '../components/radio.js';
import type { GhRadio } from '../components/radio.js';
import { GhRadioGroup } from '../components/radio-group.js';
import { cleanup, mount } from './fixture.js';

function select(el: GhRadio): void {
  const input = el.shadowRoot?.querySelector('input');
  if (!input) {
    throw new Error('input not rendered');
  }
  input.checked = true;
  input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
}

describe('gh-radio-group', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-radio-group')).toBe(GhRadioGroup);
  });

  it('exposes the radiogroup role and an accessible name', async () => {
    const el = await mount(new GhRadioGroup());
    el.label = 'Size';
    await el.updateComplete;
    expect(el.getAttribute('role')).toBeNull(); // role is set via ElementInternals, not a reflected attribute
    const internals = (el as unknown as { internals: ElementInternals }).internals;
    expect(internals.role).toBe('radiogroup');
    expect(internals.ariaLabel).toBe('Size');
  });

  it('unchecks every other slotted radio when one is selected', async () => {
    const el = await mount(new GhRadioGroup());
    el.innerHTML =
      '<gh-radio name="size" value="sm"></gh-radio><gh-radio name="size" value="md"></gh-radio>';
    await el.updateComplete;
    const [small, medium] = Array.from(el.querySelectorAll<GhRadio>('gh-radio'));
    if (!small || !medium) {
      throw new Error('radios not rendered');
    }
    await small.updateComplete;
    await medium.updateComplete;

    select(small);
    expect(small.checked).toBe(true);
    expect(medium.checked).toBe(false);

    select(medium);
    expect(small.checked).toBe(false);
    expect(medium.checked).toBe(true);
  });

  it('unchecks siblings when `checked` is set programmatically (no `change` event)', async () => {
    const el = await mount(new GhRadioGroup());
    el.innerHTML =
      '<gh-radio name="size" value="sm" checked></gh-radio><gh-radio name="size" value="md"></gh-radio>';
    await el.updateComplete;
    const [small, medium] = Array.from(el.querySelectorAll<GhRadio>('gh-radio'));
    if (!small || !medium) {
      throw new Error('radios not rendered');
    }
    await small.updateComplete;
    await medium.updateComplete;
    expect(small.checked).toBe(true);

    medium.checked = true;
    await medium.updateComplete;
    // The MutationObserver callback fires as a microtask after the attribute reflects.
    await Promise.resolve();
    await Promise.resolve();

    expect(small.checked).toBe(false);
    expect(medium.checked).toBe(true);
  });

  it('lays out slotted radios in a row when layout="row"', async () => {
    const el = await mount(new GhRadioGroup());
    el.layout = 'row';
    await el.updateComplete;
    expect(el.getAttribute('layout')).toBe('row');
  });
});
