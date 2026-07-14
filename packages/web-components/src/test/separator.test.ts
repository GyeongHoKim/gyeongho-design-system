import { afterEach, describe, expect, it } from 'vitest';
import { GhSeparator } from '../components/separator.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-separator', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-separator')).toBe(GhSeparator);
  });

  it('exposes separator semantics with orientation', async () => {
    const el = await mount(new GhSeparator());
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    const internals = (el as any).internals as ElementInternals;
    expect(internals.role).toBe('separator');
    expect(internals.ariaOrientation).toBe('horizontal');
    el.orientation = 'vertical';
    await el.updateComplete;
    expect(internals.ariaOrientation).toBe('vertical');
  });

  it('is hidden from assistive tech when decorative', async () => {
    const el = await mount(new GhSeparator());
    el.decorative = true;
    await el.updateComplete;
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.role).toBe('none');
  });

  it('draws a sketch line once measured', async () => {
    const el = await mount(new GhSeparator());
    await setSize(el, 200, 8);
    expect(el.shadowRoot?.querySelectorAll('.sketch-stroke').length).toBeGreaterThan(0);
  });
});
