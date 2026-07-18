import { afterEach, describe, expect, it } from 'vitest';
import { GhMarker } from '../components/marker.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-marker', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-marker')).toBe(GhMarker);
  });

  it('wraps slotted text in a semantic mark', async () => {
    const el = await mount(new GhMarker());
    el.textContent = 'highlight me';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('mark slot')).not.toBeNull();
    expect(el.textContent).toContain('highlight me');
  });

  it('defaults to the default variant and reflects it', async () => {
    const el = await mount(new GhMarker());
    expect(el.variant).toBe('default');
    el.variant = 'danger';
    await el.updateComplete;
    expect(el.getAttribute('variant')).toBe('danger');
  });

  it('paints a hachure fill with no outline box once measured', async () => {
    const el = await mount(new GhMarker());
    await setSize(el, 120, 24);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-fill').length ?? 0).toBeGreaterThan(0);
    // "no hard box" — the outline strokes are stripped.
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length ?? 0).toBe(0);
  });
});
