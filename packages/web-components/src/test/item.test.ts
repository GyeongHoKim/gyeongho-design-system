import { afterEach, describe, expect, it } from 'vitest';
import { GhItem } from '../components/item.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-item', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-item')).toBe(GhItem);
  });

  it('renders media, content and actions slots', async () => {
    const el = await mount(new GhItem());
    const names = [...(el.shadowRoot?.querySelectorAll('slot') ?? [])].map((s) =>
      s.getAttribute('name'),
    );
    expect(names).toContain('media');
    expect(names).toContain('actions');
    // The default (unnamed) content slot is present.
    expect(names).toContain(null);
  });

  it('defaults to the default variant, unselected', async () => {
    const el = await mount(new GhItem());
    expect(el.variant).toBe('default');
    expect(el.selected).toBe(false);
    expect(el.hasAttribute('selected')).toBe(false);
  });

  it('reflects variant and selected attributes', async () => {
    const el = await mount(new GhItem());
    el.variant = 'muted';
    el.selected = true;
    await el.updateComplete;
    expect(el.getAttribute('variant')).toBe('muted');
    expect(el.hasAttribute('selected')).toBe(true);
  });

  it('draws a sketch border only for the outline variant', async () => {
    const plain = await mount(new GhItem());
    await setSize(plain, 320, 64);
    expect(plain.shadowRoot?.querySelectorAll('path.sketch-stroke').length ?? 0).toBe(0);

    const outlined = await mount(new GhItem());
    outlined.variant = 'outline';
    await outlined.updateComplete;
    await setSize(outlined, 320, 64);
    expect(outlined.shadowRoot?.querySelectorAll('path.sketch-stroke').length ?? 0).toBeGreaterThan(
      0,
    );
  });
});
