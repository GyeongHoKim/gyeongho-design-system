import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhInput } from '../components/input.js';
import { cleanup, mount, setSize } from './fixture.js';

function typeInto(el: GhInput, value: string): void {
  const input = el.shadowRoot?.querySelector('input');
  if (!input) {
    throw new Error('input not rendered');
  }
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

describe('gh-input', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-input')).toBe(GhInput);
  });

  it('renders a native input', async () => {
    const el = await mount(new GhInput());
    expect(el.shadowRoot?.querySelector('input')).not.toBeNull();
  });

  it('associates a visible label with the input', async () => {
    const el = await mount(new GhInput());
    el.label = 'Email';
    await el.updateComplete;
    const label = el.shadowRoot?.querySelector('label');
    const input = el.shadowRoot?.querySelector('input');
    expect(label?.getAttribute('for')).toBe(input?.id);
  });

  it('falls back to an aria-label from the placeholder', async () => {
    const el = await mount(new GhInput());
    el.placeholder = 'Search';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('input')?.getAttribute('aria-label')).toBe('Search');
  });

  it('updates value and emits input on typing', async () => {
    const el = await mount(new GhInput());
    const onInput = vi.fn();
    el.addEventListener('input', onInput);
    typeInto(el, 'hello');
    expect(el.value).toBe('hello');
    expect(onInput).toHaveBeenCalled();
  });

  it('is form-associated (resolves its owning form)', async () => {
    const form = document.createElement('form');
    const el = new GhInput();
    el.name = 'email';
    form.append(el);
    document.body.append(form);
    await el.updateComplete;
    typeInto(el, 'a@b.com');
    expect(el.form).toBe(form);
    expect(el.value).toBe('a@b.com');
  });

  it('reports a valueMissing validity error when required and empty', async () => {
    const el = await mount(new GhInput());
    el.required = true;
    await el.updateComplete;
    expect(el.validity.valueMissing).toBe(true);
    typeInto(el, 'x');
    await el.updateComplete;
    expect(el.validity.valueMissing).toBe(false);
  });

  it('clears its value via the form reset callback', async () => {
    const el = await mount(new GhInput());
    typeInto(el, 'text');
    expect(el.value).toBe('text');
    el.formResetCallback();
    await el.updateComplete;
    expect(el.value).toBe('');
  });

  it('mirrors the form-disabled callback to the disabled property', async () => {
    const el = await mount(new GhInput());
    el.formDisabledCallback(true);
    await el.updateComplete;
    expect(el.disabled).toBe(true);
  });

  it('draws a sketchy outline once sized', async () => {
    const el = await mount(new GhInput());
    await setSize(el, 220, 44);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
  });
});
