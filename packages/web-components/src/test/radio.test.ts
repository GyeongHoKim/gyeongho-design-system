import { afterEach, describe, expect, it } from 'vitest';
import { GhRadio } from '../components/radio.js';
import { cleanup, mount, setSize } from './fixture.js';

function select(el: GhRadio): void {
  const input = el.shadowRoot?.querySelector('input');
  if (!input) {
    throw new Error('input not rendered');
  }
  input.checked = true;
  input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
}

describe('gh-radio', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-radio')).toBe(GhRadio);
  });

  it('renders a native radio input', async () => {
    const el = await mount(new GhRadio());
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.type).toBe('radio');
  });

  it('associates a visible label with the input', async () => {
    const el = await mount(new GhRadio());
    el.label = 'Small';
    await el.updateComplete;
    const label = el.shadowRoot?.querySelector('label');
    const input = el.shadowRoot?.querySelector('input');
    expect(label?.getAttribute('for')).toBe(input?.id);
  });

  it('checks and emits change', async () => {
    const el = await mount(new GhRadio());
    expect(el.checked).toBe(false);
    select(el);
    expect(el.checked).toBe(true);
  });

  it('is form-associated (resolves its owning form)', async () => {
    const form = document.createElement('form');
    const el = new GhRadio();
    el.name = 'size';
    el.value = 'sm';
    form.append(el);
    document.body.append(form);
    await el.updateComplete;
    expect(el.form).toBe(form);
  });

  it('clears checked via the form reset callback', async () => {
    const el = await mount(new GhRadio());
    select(el);
    expect(el.checked).toBe(true);
    el.formResetCallback();
    await el.updateComplete;
    expect(el.checked).toBe(false);
  });

  it('mirrors the form-disabled callback to the disabled property', async () => {
    const el = await mount(new GhRadio());
    el.formDisabledCallback(true);
    await el.updateComplete;
    expect(el.disabled).toBe(true);
  });

  it('draws a sketchy ring once sized', async () => {
    const el = await mount(new GhRadio());
    await setSize(el, 24, 24);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
  });

  it('renders the checked dot only when checked', async () => {
    const el = await mount(new GhRadio());
    await setSize(el, 24, 24);
    expect(el.shadowRoot?.querySelector('.dot')).toBeNull();
    select(el);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.dot')).not.toBeNull();
  });
});
