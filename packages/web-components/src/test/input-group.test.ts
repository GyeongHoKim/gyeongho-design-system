import { afterEach, describe, expect, it } from 'vitest';
import { GhInputGroup } from '../components/input-group.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-input-group', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-input-group')).toBe(GhInputGroup);
  });

  it('renders a default slot inside the group box', async () => {
    const el = await mount(new GhInputGroup());
    el.innerHTML = '<input />';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.group slot')).not.toBeNull();
    expect(el.querySelector('input')).not.toBeNull();
  });

  it('defaults to enabled and valid', async () => {
    const el = await mount(new GhInputGroup());
    expect(el.disabled).toBe(false);
    expect(el.invalid).toBe(false);
  });

  it('reflects disabled and invalid attributes', async () => {
    const el = await mount(new GhInputGroup());
    el.disabled = true;
    el.invalid = true;
    await el.updateComplete;
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(el.hasAttribute('invalid')).toBe(true);
  });

  it('draws the sketch border box once measured', async () => {
    const el = await mount(new GhInputGroup());
    await setSize(el, 280, 40);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length ?? 0).toBeGreaterThan(0);
  });
});
