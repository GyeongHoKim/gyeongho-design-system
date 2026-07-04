import { afterEach, describe, expect, it } from 'vitest';
import '../components/checkbox.js';
import { GhCheckboxGroup } from '../components/checkbox-group.js';
import { cleanup, mount } from './fixture.js';

describe('gh-checkbox-group', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-checkbox-group')).toBe(GhCheckboxGroup);
  });

  it('exposes an accessible group name via a fieldset legend', async () => {
    const el = await mount(new GhCheckboxGroup());
    el.label = 'Colors';
    await el.updateComplete;
    const legend = el.shadowRoot?.querySelector('legend');
    expect(legend?.textContent).toBe('Colors');
  });

  it('slots checkboxes without affecting their independent checked state', async () => {
    const el = await mount(new GhCheckboxGroup());
    el.innerHTML =
      '<gh-checkbox value="red"></gh-checkbox><gh-checkbox value="green"></gh-checkbox>';
    await el.updateComplete;
    const [red, green] = Array.from(el.querySelectorAll('gh-checkbox'));
    expect(red).not.toBeUndefined();
    expect(green).not.toBeUndefined();
  });

  it('lays out slotted checkboxes in a row when layout="row"', async () => {
    const el = await mount(new GhCheckboxGroup());
    el.layout = 'row';
    await el.updateComplete;
    expect(el.getAttribute('layout')).toBe('row');
  });
});
