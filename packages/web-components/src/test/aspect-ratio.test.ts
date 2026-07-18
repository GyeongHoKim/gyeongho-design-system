import { afterEach, describe, expect, it } from 'vitest';
import { GhAspectRatio } from '../components/aspect-ratio.js';
import { cleanup, mount } from './fixture.js';

describe('gh-aspect-ratio', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-aspect-ratio')).toBe(GhAspectRatio);
  });

  it('defaults the ratio to 1', async () => {
    const el = await mount(new GhAspectRatio());
    expect(el.ratio).toBe(1);
    expect(el.style.aspectRatio).toBe('1');
  });

  it('applies the ratio to the host aspect-ratio style', async () => {
    const el = await mount(new GhAspectRatio());
    el.ratio = 16 / 9;
    await el.updateComplete;
    expect(el.style.aspectRatio).toBe(String(16 / 9));
  });

  it('renders a default slot for content', async () => {
    const el = await mount(new GhAspectRatio());
    el.innerHTML = '<img alt="" />';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('slot')).not.toBeNull();
    expect(el.querySelector('img')).not.toBeNull();
  });
});
