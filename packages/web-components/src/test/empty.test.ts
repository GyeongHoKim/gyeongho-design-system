import { afterEach, describe, expect, it } from 'vitest';
import { GhEmpty } from '../components/empty.js';
import { cleanup, mount } from './fixture.js';

describe('gh-empty', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-empty')).toBe(GhEmpty);
  });

  it('renders heading and description when set', async () => {
    const el = await mount(new GhEmpty());
    el.heading = 'No results';
    el.description = 'Try another search.';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.title')?.textContent).toContain('No results');
    expect(el.shadowRoot?.querySelector('.description')?.textContent).toContain('another search');
  });

  it('exposes icon and actions slots', async () => {
    const el = await mount(new GhEmpty());
    expect(el.shadowRoot?.querySelector('slot[name="icon"]')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('slot[name="actions"]')).not.toBeNull();
  });
});
