import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GhHoverCard } from '../components/hover-card.js';
import { cleanup, mount } from './fixture.js';

describe('gh-hover-card', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('registers as a custom element', () => {
    expect(customElements.get('gh-hover-card')).toBe(GhHoverCard);
  });

  it('reveals after the hover delay', async () => {
    const el = await mount(new GhHoverCard());
    el.delay = 200;
    el.dispatchEvent(new MouseEvent('mouseenter'));
    expect(el.open).toBe(false);
    vi.advanceTimersByTime(200);
    await el.updateComplete;
    expect(el.open).toBe(true);
  });

  it('reveals immediately on focus and links aria-describedby', async () => {
    const el = await mount(new GhHoverCard());
    el.dispatchEvent(new FocusEvent('focusin'));
    await el.updateComplete;
    expect(el.open).toBe(true);
    const trigger = el.shadowRoot?.querySelector('.trigger');
    expect(trigger?.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('dismisses on Escape', async () => {
    const el = await mount(new GhHoverCard());
    el.dispatchEvent(new FocusEvent('focusin'));
    await el.updateComplete;
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await el.updateComplete;
    expect(el.open).toBe(false);
  });
});
