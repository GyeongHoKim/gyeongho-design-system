import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhAlert } from '../components/alert.js';
import { cleanup, mount } from './fixture.js';

describe('gh-alert', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-alert')).toBe(GhAlert);
  });

  it('renders the heading and slotted body with a status role', async () => {
    const el = await mount(new GhAlert());
    el.variant = 'success';
    el.heading = 'Saved';
    el.textContent = 'All good';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.title')?.textContent).toBe('Saved');
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.role).toBe('status');
  });

  it('uses the assertive alert role for danger', async () => {
    const el = await mount(new GhAlert());
    el.variant = 'danger';
    await el.updateComplete;
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.role).toBe('alert');
  });

  it('dispatches dismiss from the close button when dismissible', async () => {
    const el = await mount(new GhAlert());
    el.dismissible = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('dismiss', handler);
    el.shadowRoot?.querySelector<HTMLButtonElement>('.close')?.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
