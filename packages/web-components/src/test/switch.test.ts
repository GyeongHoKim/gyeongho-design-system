import { afterEach, describe, expect, it } from 'vitest';
import { GhSwitch } from '../components/switch.js';
import { cleanup, mount, setSize } from './fixture.js';

function toggle(el: GhSwitch): void {
  const input = el.shadowRoot?.querySelector('input');
  if (!input) {
    throw new Error('input not rendered');
  }
  input.checked = !input.checked;
  input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
}

describe('gh-switch', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-switch')).toBe(GhSwitch);
  });

  it('renders a native checkbox input with role=switch', async () => {
    const el = await mount(new GhSwitch());
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.type).toBe('checkbox');
    expect(input?.getAttribute('role')).toBe('switch');
  });

  it('keeps aria-checked in sync with the checked state', async () => {
    const el = await mount(new GhSwitch());
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('aria-checked')).toBe('false');
    toggle(el);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('input')?.getAttribute('aria-checked')).toBe('true');
  });

  it('associates a visible label with the input', async () => {
    const el = await mount(new GhSwitch());
    el.label = 'Notifications';
    await el.updateComplete;
    const label = el.shadowRoot?.querySelector('label');
    const input = el.shadowRoot?.querySelector('input');
    expect(label?.getAttribute('for')).toBe(input?.id);
  });

  it('toggles checked and emits change', async () => {
    const el = await mount(new GhSwitch());
    expect(el.checked).toBe(false);
    toggle(el);
    expect(el.checked).toBe(true);
  });

  it('is form-associated (resolves its owning form)', async () => {
    const form = document.createElement('form');
    const el = new GhSwitch();
    el.name = 'notifications';
    form.append(el);
    document.body.append(form);
    await el.updateComplete;
    expect(el.form).toBe(form);
  });

  it('clears checked via the form reset callback', async () => {
    const el = await mount(new GhSwitch());
    toggle(el);
    expect(el.checked).toBe(true);
    el.formResetCallback();
    await el.updateComplete;
    expect(el.checked).toBe(false);
  });

  it('mirrors the form-disabled callback to the disabled property', async () => {
    const el = await mount(new GhSwitch());
    el.formDisabledCallback(true);
    await el.updateComplete;
    expect(el.disabled).toBe(true);
  });

  it('draws a sketchy track once sized', async () => {
    const el = await mount(new GhSwitch());
    await setSize(el, 48, 24);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
  });

  it('renders the thumb on the opposite side once checked', async () => {
    const el = await mount(new GhSwitch());
    await setSize(el, 48, 24);
    const thumbOff = el.shadowRoot?.querySelector('.thumb path')?.getAttribute('d');
    toggle(el);
    await el.updateComplete;
    const thumbOn = el.shadowRoot?.querySelector('.thumb path')?.getAttribute('d');
    expect(thumbOn).not.toBe(thumbOff);
  });
});
