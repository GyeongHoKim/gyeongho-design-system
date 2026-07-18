import { afterEach, describe, expect, it } from 'vitest';
import { GhDirection } from '../components/direction.js';
import { cleanup, mount } from './fixture.js';

describe('gh-direction', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-direction')).toBe(GhDirection);
  });

  it('defaults to ltr', async () => {
    const el = await mount(new GhDirection());
    expect(el.dir).toBe('ltr');
    expect(el.getAttribute('dir')).toBe('ltr');
  });

  it('mirrors dir onto the host attribute', async () => {
    const el = await mount(new GhDirection());
    el.dir = 'rtl';
    await el.updateComplete;
    expect(el.getAttribute('dir')).toBe('rtl');
  });

  it('renders a default slot for the subtree', async () => {
    const el = await mount(new GhDirection());
    el.innerHTML = '<span>child</span>';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('slot')).not.toBeNull();
    expect(el.textContent).toContain('child');
  });
});
