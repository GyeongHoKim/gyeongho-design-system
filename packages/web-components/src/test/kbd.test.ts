import { afterEach, describe, expect, it } from 'vitest';
import { GhKbd } from '../components/kbd.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-kbd', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-kbd')).toBe(GhKbd);
  });

  it('renders slotted key text inside a kbd element', async () => {
    const el = await mount(new GhKbd());
    el.textContent = 'Ctrl';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('kbd')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('.label slot')).not.toBeNull();
  });

  it('draws a sketch box once measured', async () => {
    const el = await mount(new GhKbd());
    await setSize(el, 40, 24);
    expect(el.shadowRoot?.querySelectorAll('.sketch-stroke').length).toBeGreaterThan(0);
    expect(el.shadowRoot?.querySelectorAll('.sketch-fill').length).toBeGreaterThan(0);
  });
});
