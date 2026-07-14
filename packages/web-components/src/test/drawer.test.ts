import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhDrawer } from '../components/drawer.js';
import { cleanup, mount } from './fixture.js';

describe('gh-drawer', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-drawer')).toBe(GhDrawer);
  });

  it('renders a dialog with a grabber handle and heading', async () => {
    const el = await mount(new GhDrawer());
    el.heading = 'Options';
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.handle')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('.title')?.textContent).toBe('Options');
  });

  it('requests close on cancel (Escape)', async () => {
    const el = await mount(new GhDrawer());
    el.open = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('close', handler);
    const evt = new Event('cancel', { cancelable: true });
    el.shadowRoot?.querySelector('dialog')?.dispatchEvent(evt);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(evt.defaultPrevented).toBe(true);
  });

  it('does not close on backdrop click when closeOnScrimClick is false', async () => {
    const el = await mount(new GhDrawer());
    el.closeOnScrimClick = false;
    el.open = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('close', handler);
    const dialog = el.shadowRoot?.querySelector('dialog') as HTMLElement;
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));
    expect(handler).not.toHaveBeenCalled();
  });
});
