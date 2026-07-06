import { afterEach, describe, expect, it } from 'vitest';
import { GhSpinner } from '../components/spinner.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-spinner', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-spinner')).toBe(GhSpinner);
  });

  it('exposes a status role with a default label', async () => {
    const el = await mount(new GhSpinner());
    await el.updateComplete;
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.role).toBe('status');
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.ariaLabel).toBe('Loading');
  });

  it('applies a custom label', async () => {
    const el = await mount(new GhSpinner());
    el.label = 'Saving';
    await el.updateComplete;
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.ariaLabel).toBe('Saving');
  });

  it('reflects the size attribute', async () => {
    const el = await mount(new GhSpinner());
    el.size = 'lg';
    await el.updateComplete;
    expect(el.getAttribute('size')).toBe('lg');
  });

  it('draws a sketch ellipse outline once measured', async () => {
    const el = await mount(new GhSpinner());
    await setSize(el, 24, 24);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
  });
});
