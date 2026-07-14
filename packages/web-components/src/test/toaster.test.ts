import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GhToaster, ToastController, toast } from '../components/toaster.js';
import { cleanup, mount } from './fixture.js';

describe('gh-toaster', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    toast.clear();
    vi.useRealTimers();
    cleanup();
  });

  it('registers as a custom element', () => {
    expect(customElements.get('gh-toaster')).toBe(GhToaster);
  });

  it('stacks toasts added via show and renders gh-toast items', async () => {
    const el = await mount(new GhToaster());
    el.show({ heading: 'First', message: 'one' });
    el.show({ heading: 'Second', message: 'two' });
    await el.updateComplete;
    expect(el.shadowRoot?.querySelectorAll('gh-toast').length).toBe(2);
  });

  it('auto-dismisses after the duration', async () => {
    const el = await mount(new GhToaster());
    el.show({ message: 'bye', duration: 3000 });
    await el.updateComplete;
    expect(el.shadowRoot?.querySelectorAll('gh-toast').length).toBe(1);
    vi.advanceTimersByTime(3000);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelectorAll('gh-toast').length).toBe(0);
  });

  it('dismiss(id) removes a specific toast', async () => {
    const el = await mount(new GhToaster());
    const id = el.show({ message: 'keep', duration: 0 });
    el.show({ message: 'other', duration: 0 });
    await el.updateComplete;
    el.dismiss(id);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelectorAll('gh-toast').length).toBe(1);
  });

  it('reflects the position attribute', async () => {
    const el = await mount(new GhToaster());
    el.position = 'top-center';
    await el.updateComplete;
    expect(el.getAttribute('position')).toBe('top-center');
  });

  it('imperative toast() targets the active toaster with variant helpers', async () => {
    const el = await mount(new GhToaster());
    toast.success('Saved', { duration: 0 });
    await el.updateComplete;
    const item = el.shadowRoot?.querySelector('gh-toast');
    expect(item?.getAttribute('variant')).toBe('success');
  });

  it('ToastController binds to a specific toaster', async () => {
    const el = await mount(new GhToaster());
    const controller = new ToastController(el);
    controller.show({ message: 'hi', duration: 0 });
    await el.updateComplete;
    expect(el.shadowRoot?.querySelectorAll('gh-toast').length).toBe(1);
  });
});
