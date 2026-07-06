import { afterEach, describe, expect, it } from 'vitest';
import { GhAvatar } from '../components/avatar.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-avatar', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-avatar')).toBe(GhAvatar);
  });

  it('renders initials derived from the name when there is no src', async () => {
    const el = await mount(new GhAvatar());
    el.name = 'Ada Lovelace';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.initials')?.textContent).toBe('AL');
    expect(el.shadowRoot?.querySelector('img')).toBeNull();
  });

  it('renders an image when a src is provided', async () => {
    const el = await mount(new GhAvatar());
    el.src = '/ada.png';
    el.name = 'Ada Lovelace';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('img')?.getAttribute('src')).toBe('/ada.png');
  });

  it('exposes an img role with the name as its label', async () => {
    const el = await mount(new GhAvatar());
    el.name = 'Ada Lovelace';
    await el.updateComplete;
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.role).toBe('img');
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.ariaLabel).toBe('Ada Lovelace');
  });

  it('is decorative when it has neither name nor alt', async () => {
    const el = await mount(new GhAvatar());
    await el.updateComplete;
    // biome-ignore lint/suspicious/noExplicitAny: reading ElementInternals in test
    expect((el as any).internals.role).toBeNull();
  });

  it('draws a sketch ellipse outline once measured', async () => {
    const el = await mount(new GhAvatar());
    await setSize(el, 32, 32);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length).toBeGreaterThan(0);
  });
});
