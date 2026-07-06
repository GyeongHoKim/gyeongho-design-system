import { afterEach, describe, expect, it } from 'vitest';
import { GhSkeleton } from '../components/skeleton.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-skeleton', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-skeleton')).toBe(GhSkeleton);
  });

  it('is decorative (host is aria-hidden)', async () => {
    const el = await mount(new GhSkeleton());
    await el.updateComplete;
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('reflects the variant attribute', async () => {
    const el = await mount(new GhSkeleton());
    el.variant = 'circle';
    await el.updateComplete;
    expect(el.getAttribute('variant')).toBe('circle');
  });

  it('draws a sketch fill once measured', async () => {
    const el = await mount(new GhSkeleton());
    await setSize(el, 200, 24);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
  });

  it('applies explicit width and height to the host box', async () => {
    const el = await mount(new GhSkeleton());
    el.width = '120px';
    el.height = '12px';
    await el.updateComplete;
    expect(el.style.width).toBe('120px');
    expect(el.style.height).toBe('12px');
  });

  it('renders a circle as a square from a single dimension', async () => {
    const el = await mount(new GhSkeleton());
    el.variant = 'circle';
    el.width = '50px';
    await el.updateComplete;
    // Both axes derive from the one supplied dimension — not an ellipse.
    expect(el.style.width).toBe('50px');
    expect(el.style.height).toBe('50px');
  });
});
