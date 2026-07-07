import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GhToast } from '../components/toast.js';
import { cleanup, mount } from './fixture.js';

describe('gh-toast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('registers as a custom element', () => {
    expect(customElements.get('gh-toast')).toBe(GhToast);
  });

  it('exposes a status role (alert for danger)', async () => {
    const el = await mount(new GhToast());
    el.variant = 'danger';
    await el.updateComplete;
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.role).toBe('alert');
  });

  it('auto-dismisses after the duration', async () => {
    const el = await mount(new GhToast());
    const handler = vi.fn();
    el.addEventListener('close', handler);
    el.duration = 4000;
    el.open = true;
    await el.updateComplete;
    expect(handler).not.toHaveBeenCalled();
    vi.advanceTimersByTime(4000);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not auto-dismiss when duration is 0', async () => {
    const el = await mount(new GhToast());
    const handler = vi.fn();
    el.addEventListener('close', handler);
    el.duration = 0;
    el.open = true;
    await el.updateComplete;
    vi.advanceTimersByTime(60000);
    expect(handler).not.toHaveBeenCalled();
  });
});
