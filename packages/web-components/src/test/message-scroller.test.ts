import { afterEach, describe, expect, it } from 'vitest';
import { GhMessageScroller } from '../components/message-scroller.js';
import { cleanup, mount } from './fixture.js';

/** Give the viewport a measurable, scrollable geometry (jsdom reports zeros). */
function stubViewport(el: GhMessageScroller, scrollHeight: number, clientHeight: number): void {
  const viewport = el.shadowRoot?.querySelector<HTMLElement>('.viewport');
  if (!viewport) {
    throw new Error('missing viewport');
  }
  Object.defineProperty(viewport, 'scrollHeight', { value: scrollHeight, configurable: true });
  Object.defineProperty(viewport, 'clientHeight', { value: clientHeight, configurable: true });
  let top = 0;
  Object.defineProperty(viewport, 'scrollTop', {
    get: () => top,
    set: (v: number) => {
      top = v;
    },
    configurable: true,
  });
}

describe('gh-message-scroller', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-message-scroller')).toBe(GhMessageScroller);
  });

  it('defaults to stick-to-bottom, reflected', async () => {
    const el = await mount(new GhMessageScroller());
    expect(el.stickToBottom).toBe(true);
    expect(el.hasAttribute('stick-to-bottom')).toBe(true);
  });

  it('renders a scroll viewport with a default slot', async () => {
    const el = await mount(new GhMessageScroller());
    el.innerHTML = '<p>msg</p>';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.viewport slot')).not.toBeNull();
    expect(el.textContent).toContain('msg');
  });

  it('scrollToBottom pins the viewport to the newest message', async () => {
    const el = await mount(new GhMessageScroller());
    stubViewport(el, 800, 200);
    el.scrollToBottom();
    const viewport = el.shadowRoot?.querySelector<HTMLElement>('.viewport');
    expect(viewport?.scrollTop).toBe(800);
  });

  it('auto-follows new content while the reader is at the bottom', async () => {
    const el = await mount(new GhMessageScroller());
    stubViewport(el, 400, 200);
    el.scrollToBottom();
    const viewport = el.shadowRoot?.querySelector<HTMLElement>('.viewport');
    // Grow the content and append a child; the MutationObserver should re-pin.
    Object.defineProperty(viewport, 'scrollHeight', { value: 1000, configurable: true });
    el.append(document.createElement('p'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(viewport?.scrollTop).toBe(1000);
  });

  it('stops following once the reader scrolls up', async () => {
    const el = await mount(new GhMessageScroller());
    stubViewport(el, 1000, 200);
    const viewport = el.shadowRoot?.querySelector<HTMLElement>('.viewport');
    if (!viewport) {
      throw new Error('missing viewport');
    }
    // Reader scrolls to the top, away from the bottom.
    viewport.scrollTop = 0;
    viewport.dispatchEvent(new Event('scroll'));
    Object.defineProperty(viewport, 'scrollHeight', { value: 1400, configurable: true });
    el.append(document.createElement('p'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(viewport.scrollTop).toBe(0);
  });
});
