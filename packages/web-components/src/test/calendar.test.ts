import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhCalendar } from '../components/calendar.js';
import { cleanup, mount } from './fixture.js';

async function mountCalendar(value = '2024-03-15'): Promise<GhCalendar> {
  const el = new GhCalendar();
  el.value = value;
  await mount(el);
  await el.updateComplete;
  return el;
}

describe('gh-calendar', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-calendar')).toBe(GhCalendar);
  });

  it('renders a grid for the selected month', async () => {
    const el = await mountCalendar();
    expect(el.shadowRoot?.querySelector('[role="grid"]')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('.title')?.textContent).toContain('March 2024');
    // 6 weeks * 7 days
    expect(el.shadowRoot?.querySelectorAll('.day').length).toBe(42);
  });

  it('marks the selected day and gives it the roving tabindex', async () => {
    const el = await mountCalendar();
    const selected = el.shadowRoot?.querySelector('.day.selected') as HTMLElement;
    expect(selected?.dataset.date).toBe('2024-03-15');
    expect(selected?.getAttribute('tabindex')).toBe('0');
  });

  it('selects a day on click and dispatches select', async () => {
    const el = await mountCalendar();
    const handler = vi.fn();
    el.addEventListener('select', handler);
    (el.shadowRoot?.querySelector('[data-date="2024-03-20"]') as HTMLElement).click();
    await el.updateComplete;
    expect(el.value).toBe('2024-03-20');
    expect((handler.mock.calls[0][0] as CustomEvent<string>).detail).toBe('2024-03-20');
  });

  it('changes month with the nav buttons', async () => {
    const el = await mountCalendar();
    (el.shadowRoot?.querySelector('[aria-label="Next month"]') as HTMLButtonElement).click();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.title')?.textContent).toContain('April 2024');
    // The roving tabindex must stay inside the visible month so the grid keeps a
    // tab stop; the clamped day-of-month (15) lands on April 15.
    const focusable = el.shadowRoot?.querySelector('.day[tabindex="0"]') as HTMLElement;
    expect(focusable?.dataset.date).toBe('2024-04-15');
  });

  it('moves the focused date with arrow keys', async () => {
    const el = await mountCalendar();
    const grid = el.shadowRoot?.querySelector('[role="grid"]') as HTMLElement;
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await el.updateComplete;
    const focusable = el.shadowRoot?.querySelector('.day[tabindex="0"]') as HTMLElement;
    expect(focusable?.dataset.date).toBe('2024-03-16');
  });
});
