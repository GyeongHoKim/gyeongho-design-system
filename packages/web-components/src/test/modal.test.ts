import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhModal } from '../components/modal.js';
import { cleanup, mount } from './fixture.js';

describe('gh-modal', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-modal')).toBe(GhModal);
  });

  it('renders a dialog with the heading and aria-labelledby', async () => {
    const el = await mount(new GhModal());
    el.heading = 'Settings';
    el.open = true;
    await el.updateComplete;
    const dialog = el.shadowRoot?.querySelector('dialog');
    expect(dialog).not.toBeNull();
    const titleId = el.shadowRoot?.querySelector('.title')?.id;
    expect(dialog?.getAttribute('aria-labelledby')).toBe(titleId);
    expect(el.shadowRoot?.querySelector('.title')?.textContent).toBe('Settings');
  });

  it('requests close on cancel (Escape)', async () => {
    const el = await mount(new GhModal());
    el.open = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('close', handler);
    const dialog = el.shadowRoot?.querySelector('dialog');
    const cancel = new Event('cancel', { cancelable: true });
    dialog?.dispatchEvent(cancel);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(cancel.defaultPrevented).toBe(true);
  });

  it('requests close on a backdrop click (outside the panel box) but not inside it', async () => {
    const el = await mount(new GhModal());
    el.open = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('close', handler);
    const dialog = el.shadowRoot?.querySelector('dialog') as HTMLElement;
    // jsdom reports a 0×0 box; a click at (10,10) is outside it → backdrop.
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));
    expect(handler).toHaveBeenCalledTimes(1);
    // A click at the box origin (0,0) is inside → must NOT close.
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 0, clientY: 0 }));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
