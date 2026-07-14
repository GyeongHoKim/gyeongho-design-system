import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhDatePicker } from '../components/date-picker.js';
import { cleanup, mount } from './fixture.js';

describe('gh-date-picker', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-date-picker')).toBe(GhDatePicker);
  });

  it('shows the selected value in a readonly field', async () => {
    const el = await mount(new GhDatePicker());
    el.value = '2024-05-01';
    await el.updateComplete;
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input.readOnly).toBe(true);
    expect(input.value).toBe('2024-05-01');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens a popover calendar on click', async () => {
    const el = await mount(new GhDatePicker());
    (el.shadowRoot?.querySelector('input') as HTMLInputElement).click();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.popover')?.classList.contains('open')).toBe(true);
    expect(el.shadowRoot?.querySelector('gh-calendar')).not.toBeNull();
  });

  it('sets the value from a calendar selection and closes', async () => {
    const el = await mount(new GhDatePicker());
    (el.shadowRoot?.querySelector('input') as HTMLInputElement).click();
    await el.updateComplete;
    const change = vi.fn();
    el.addEventListener('change', change);
    el.shadowRoot
      ?.querySelector('gh-calendar')
      ?.dispatchEvent(
        new CustomEvent('select', { detail: '2024-06-10', bubbles: true, composed: true }),
      );
    await el.updateComplete;
    expect(el.value).toBe('2024-06-10');
    expect(change).toHaveBeenCalledTimes(1);
    expect(el.shadowRoot?.querySelector('.popover')?.classList.contains('open')).toBe(false);
  });

  it('associates with a form', async () => {
    const form = document.createElement('form');
    const el = new GhDatePicker();
    el.name = 'date';
    form.append(el);
    document.body.append(form);
    await el.updateComplete;
    expect(el.form).toBe(form);
  });
});
