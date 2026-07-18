import { afterEach, describe, expect, it } from 'vitest';
import { GhNativeSelect } from '../components/native-select.js';
import { cleanup, mount, setSize } from './fixture.js';

async function mountSelect(props: Partial<GhNativeSelect> = {}): Promise<GhNativeSelect> {
  const el = new GhNativeSelect();
  el.innerHTML = `<select>
    <option value="a">Alpha</option>
    <option value="b">Bravo</option>
  </select>`;
  Object.assign(el, props);
  await mount(el);
  // Let the slotchange handler run.
  await el.updateComplete;
  return el;
}

describe('gh-native-select', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-native-select')).toBe(GhNativeSelect);
  });

  it('renders the slotted native select inside the control', async () => {
    const el = await mountSelect();
    expect(el.shadowRoot?.querySelector('.control slot')).not.toBeNull();
    expect(el.querySelector('select')).not.toBeNull();
  });

  it('renders a trailing chevron icon', async () => {
    const el = await mountSelect();
    const chevron = el.shadowRoot?.querySelector('gh-icon.chevron');
    expect(chevron?.getAttribute('name')).toBe('chevron-down');
  });

  it('renders a label and associates it with the slotted select', async () => {
    const el = await mountSelect({ label: 'Country' });
    const label = el.shadowRoot?.querySelector('.label');
    expect(label?.textContent).toContain('Country');
    const select = el.querySelector('select');
    expect(select?.getAttribute('aria-labelledby')).toBe(label?.id);
  });

  it('reflects disabled/invalid and propagates them to the slotted select', async () => {
    const el = await mountSelect({ disabled: true, invalid: true });
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(el.hasAttribute('invalid')).toBe(true);
    const select = el.querySelector('select');
    expect(select?.disabled).toBe(true);
    expect(select?.getAttribute('aria-invalid')).toBe('true');
  });

  it('draws the sketch border box once measured', async () => {
    const el = await mountSelect();
    await setSize(el, 200, 40);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length ?? 0).toBeGreaterThan(0);
  });
});
