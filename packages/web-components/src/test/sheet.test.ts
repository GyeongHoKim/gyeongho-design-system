import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhSheet } from '../components/sheet.js';
import { cleanup, mount } from './fixture.js';

describe('gh-sheet', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-sheet')).toBe(GhSheet);
  });

  it('anchors to the requested side and labels the dialog', async () => {
    const el = await mount(new GhSheet());
    el.side = 'left';
    el.heading = 'Filters';
    el.open = true;
    await el.updateComplete;
    const dialog = el.shadowRoot?.querySelector('dialog');
    expect(dialog?.getAttribute('data-side')).toBe('left');
    expect(dialog?.getAttribute('aria-labelledby')).toBe(
      el.shadowRoot?.querySelector('.title')?.id,
    );
  });

  it('requests close on cancel (Escape)', async () => {
    const el = await mount(new GhSheet());
    el.open = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('close', handler);
    const evt = new Event('cancel', { cancelable: true });
    el.shadowRoot?.querySelector('dialog')?.dispatchEvent(evt);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(evt.defaultPrevented).toBe(true);
  });

  it('requests close on a backdrop click but not inside the panel', async () => {
    const el = await mount(new GhSheet());
    el.open = true;
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('close', handler);
    const dialog = el.shadowRoot?.querySelector('dialog') as HTMLElement;
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));
    expect(handler).toHaveBeenCalledTimes(1);
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 0, clientY: 0 }));
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
