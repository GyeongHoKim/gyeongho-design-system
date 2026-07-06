import { afterEach, describe, expect, it } from 'vitest';
import { GhBadge } from '../components/badge.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-badge', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-badge')).toBe(GhBadge);
  });

  it('renders slotted content inside the pill', async () => {
    const el = await mount(new GhBadge());
    el.textContent = 'New';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.label slot')).not.toBeNull();
    expect(el.textContent).toContain('New');
  });

  it('defaults to the neutral variant', async () => {
    const el = await mount(new GhBadge());
    expect(el.variant).toBe('neutral');
  });

  it('reflects the variant attribute', async () => {
    const el = await mount(new GhBadge());
    el.variant = 'danger';
    await el.updateComplete;
    expect(el.getAttribute('variant')).toBe('danger');
  });

  it('draws a sketch outline once measured', async () => {
    const el = await mount(new GhBadge());
    await setSize(el, 60, 24);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
  });

  it('exposes an ARIA status role only when labelled', async () => {
    const el = await mount(new GhBadge());
    await el.updateComplete;
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.role).toBeNull();
    el.label = '3 unread';
    await el.updateComplete;
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.role).toBe('status');
  });
});
