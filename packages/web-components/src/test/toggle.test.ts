import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhToggle } from '../components/toggle.js';
import { cleanup, mount } from './fixture.js';

describe('gh-toggle', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-toggle')).toBe(GhToggle);
  });

  it('reflects pressed state onto aria-pressed', async () => {
    const el = await mount(new GhToggle());
    const button = el.shadowRoot?.querySelector('button');
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    el.pressed = true;
    await el.updateComplete;
    expect(button?.getAttribute('aria-pressed')).toBe('true');
  });

  it('toggles and dispatches change on click', async () => {
    const el = await mount(new GhToggle());
    const handler = vi.fn();
    el.addEventListener('change', handler);
    el.shadowRoot?.querySelector('button')?.click();
    await el.updateComplete;
    expect(el.pressed).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not toggle when disabled', async () => {
    const el = await mount(new GhToggle());
    el.disabled = true;
    await el.updateComplete;
    el.shadowRoot?.querySelector('button')?.click();
    expect(el.pressed).toBe(false);
  });

  it('associates with its containing form and resets to the default', async () => {
    const form = document.createElement('form');
    const el = new GhToggle();
    el.name = 'bold';
    form.append(el);
    document.body.append(form);
    await el.updateComplete;
    expect(el.form).toBe(form);
    el.pressed = true;
    await el.updateComplete;
    el.formResetCallback();
    await el.updateComplete;
    expect(el.pressed).toBe(false);
  });
});
