import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhCarousel } from '../components/carousel.js';
import { GhCarouselItem } from '../components/carousel-item.js';
import { cleanup, mount } from './fixture.js';

async function mountCarousel(slides = 3, props: Partial<GhCarousel> = {}): Promise<GhCarousel> {
  const el = new GhCarousel();
  el.innerHTML = Array.from(
    { length: slides },
    (_, i) => `<gh-carousel-item>Slide ${i + 1}</gh-carousel-item>`,
  ).join('');
  Object.assign(el, props);
  await mount(el);
  await el.updateComplete;
  return el;
}

function buttons(el: GhCarousel): HTMLElement[] {
  return [...(el.shadowRoot?.querySelectorAll<HTMLElement>('gh-button.control') ?? [])];
}

describe('gh-carousel', () => {
  afterEach(cleanup);

  it('registers the carousel and its item', () => {
    expect(customElements.get('gh-carousel')).toBe(GhCarousel);
    expect(customElements.get('gh-carousel-item')).toBe(GhCarouselItem);
  });

  it('exposes the carousel region and prev/next controls', async () => {
    const el = await mountCarousel();
    const region = el.shadowRoot?.querySelector('[role="region"]');
    expect(region?.getAttribute('aria-roledescription')).toBe('carousel');
    const controls = buttons(el);
    expect(controls).toHaveLength(2);
    expect(controls[0].getAttribute('aria-label')).toBe('Previous slide');
    expect(controls[1].getAttribute('aria-label')).toBe('Next slide');
  });

  it('marks each slide as an APG slide group', async () => {
    const el = await mountCarousel(2);
    const items = el.querySelectorAll('gh-carousel-item');
    expect(items).toHaveLength(2);
    expect(items[0].getAttribute('role')).toBe('group');
    expect(items[0].getAttribute('aria-roledescription')).toBe('slide');
  });

  it('reflects orientation and swaps the control icons', async () => {
    const el = await mountCarousel(3, { orientation: 'vertical' });
    await el.updateComplete;
    expect(el.getAttribute('orientation')).toBe('vertical');
    const icons = el.shadowRoot?.querySelectorAll('gh-button.control gh-icon');
    expect(icons?.[0].getAttribute('name')).toBe('chevron-up');
    expect(icons?.[1].getAttribute('name')).toBe('chevron-down');
  });

  it('renders indicator dots (one per slide) when there is more than one slide', async () => {
    const el = await mountCarousel(4);
    const dots = el.shadowRoot?.querySelectorAll('.indicators .dot');
    expect(dots).toHaveLength(4);
  });

  it('scrolls the viewport by one step when Next is activated', async () => {
    const el = await mountCarousel();
    const viewport = el.shadowRoot?.querySelector<HTMLElement>('.viewport');
    if (!viewport) {
      throw new Error('missing viewport');
    }
    const scrollBy = vi.fn();
    viewport.scrollBy = scrollBy as unknown as HTMLElement['scrollBy'];
    Object.defineProperty(viewport, 'clientWidth', { value: 300, configurable: true });
    buttons(el)[1].dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ left: 300, behavior: 'smooth' }),
    );
  });

  it('scrolls along the axis with arrow keys', async () => {
    const el = await mountCarousel();
    const viewport = el.shadowRoot?.querySelector<HTMLElement>('.viewport');
    if (!viewport) {
      throw new Error('missing viewport');
    }
    const scrollBy = vi.fn();
    viewport.scrollBy = scrollBy as unknown as HTMLElement['scrollBy'];
    Object.defineProperty(viewport, 'clientWidth', { value: 200, configurable: true });
    viewport.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }),
    );
    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ left: 200 }));
  });
});
