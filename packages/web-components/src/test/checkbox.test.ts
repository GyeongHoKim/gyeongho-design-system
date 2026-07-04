import { afterEach, describe, expect, it } from 'vitest';
import { GhCheckbox } from '../components/checkbox.js';
import { cleanup, mount, setSize } from './fixture.js';

function toggle(el: GhCheckbox): void {
  const input = el.shadowRoot?.querySelector('input');
  if (!input) {
    throw new Error('input not rendered');
  }
  input.checked = !input.checked;
  input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
}

describe('gh-checkbox', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-checkbox')).toBe(GhCheckbox);
  });

  it('renders a native checkbox input', async () => {
    const el = await mount(new GhCheckbox());
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.type).toBe('checkbox');
  });

  it('associates a visible label with the input', async () => {
    const el = await mount(new GhCheckbox());
    el.label = 'Subscribe';
    await el.updateComplete;
    const label = el.shadowRoot?.querySelector('label');
    const input = el.shadowRoot?.querySelector('input');
    expect(label?.getAttribute('for')).toBe(input?.id);
  });

  it('toggles checked and emits change', async () => {
    const el = await mount(new GhCheckbox());
    expect(el.checked).toBe(false);
    toggle(el);
    expect(el.checked).toBe(true);
  });

  it('reflects checked as a host attribute and exposes it as a form value', async () => {
    const el = await mount(new GhCheckbox());
    el.value = 'yes';
    toggle(el);
    await el.updateComplete;
    expect(el.hasAttribute('checked')).toBe(true);
  });

  it('sets the indeterminate DOM property on the native input', async () => {
    const el = await mount(new GhCheckbox());
    el.indeterminate = true;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('input')?.indeterminate).toBe(true);

    el.indeterminate = false;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('input')?.indeterminate).toBe(false);
  });

  it('is form-associated (resolves its owning form)', async () => {
    const form = document.createElement('form');
    const el = new GhCheckbox();
    el.name = 'subscribe';
    form.append(el);
    document.body.append(form);
    await el.updateComplete;
    expect(el.form).toBe(form);
  });

  it('clears checked via the form reset callback', async () => {
    const el = await mount(new GhCheckbox());
    toggle(el);
    expect(el.checked).toBe(true);
    el.formResetCallback();
    await el.updateComplete;
    expect(el.checked).toBe(false);
  });

  it('mirrors the form-disabled callback to the disabled property', async () => {
    const el = await mount(new GhCheckbox());
    el.formDisabledCallback(true);
    await el.updateComplete;
    expect(el.disabled).toBe(true);
  });

  it('draws a sketchy box once sized', async () => {
    const el = await mount(new GhCheckbox());
    await setSize(el, 24, 24);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
  });

  it('renders the check icon only when checked', async () => {
    const el = await mount(new GhCheckbox());
    await setSize(el, 24, 24);
    expect(el.shadowRoot?.querySelector('gh-icon')).toBeNull();
    toggle(el);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('gh-icon')).not.toBeNull();
  });
});
