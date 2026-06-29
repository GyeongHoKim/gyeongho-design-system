import { afterEach, describe, expect, it } from 'vitest';
import { GhCard } from '../components/card.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-card', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-card')).toBe(GhCard);
  });

  it('renders slotted content inside the surface', async () => {
    const el = await mount(new GhCard());
    el.innerHTML = '<p>Body</p>';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.content slot')).not.toBeNull();
    expect(el.textContent).toContain('Body');
  });

  it('draws only an outline when flat (no shadow paths)', async () => {
    const el = await mount(new GhCard());
    await setSize(el, 240, 160);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-shadow').length).toBe(0);
  });

  it('emits sketch shadow paths when elevated', async () => {
    const el = await mount(new GhCard());
    el.elevated = true;
    await el.updateComplete;
    await setSize(el, 240, 160);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-shadow').length).toBeGreaterThan(0);
  });

  it('reflects the elevated attribute', async () => {
    const el = await mount(new GhCard());
    el.elevated = true;
    await el.updateComplete;
    expect(el.hasAttribute('elevated')).toBe(true);
  });

  it('accepts an accessible label without error', async () => {
    const el = await mount(new GhCard());
    el.label = 'Profile';
    await el.updateComplete;
    expect(el.label).toBe('Profile');
  });
});
