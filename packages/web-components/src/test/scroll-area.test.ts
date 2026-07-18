import { afterEach, describe, expect, it } from 'vitest';
import { GhScrollArea } from '../components/scroll-area.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-scroll-area', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-scroll-area')).toBe(GhScrollArea);
  });

  it('defaults to vertical orientation and reflects it', async () => {
    const el = await mount(new GhScrollArea());
    expect(el.orientation).toBe('vertical');
    expect(el.getAttribute('orientation')).toBe('vertical');
  });

  it('reflects the orientation attribute', async () => {
    const el = await mount(new GhScrollArea());
    el.orientation = 'both';
    await el.updateComplete;
    expect(el.getAttribute('orientation')).toBe('both');
  });

  it('renders a scrollable viewport with a default slot', async () => {
    const el = await mount(new GhScrollArea());
    el.innerHTML = '<p>content</p>';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.viewport slot')).not.toBeNull();
    expect(el.textContent).toContain('content');
  });

  it('draws the sketch border box once measured', async () => {
    const el = await mount(new GhScrollArea());
    await setSize(el, 240, 200);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length ?? 0).toBeGreaterThan(0);
  });
});
