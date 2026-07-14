import { afterEach, describe, expect, it } from 'vitest';
import { GhPopover } from '../components/popover.js';
import { cleanup, mount } from './fixture.js';

describe('gh-popover', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-popover')).toBe(GhPopover);
  });

  it('renders a collapsed dialog trigger', async () => {
    const el = await mount(new GhPopover());
    el.label = 'Open';
    await el.updateComplete;
    const trigger = el.shadowRoot?.querySelector('.trigger');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens on trigger click and toggles closed', async () => {
    const el = await mount(new GhPopover());
    const trigger = el.shadowRoot?.querySelector('.trigger') as HTMLButtonElement;
    trigger.click();
    await el.updateComplete;
    expect(el.open).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    trigger.click();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('closes on Escape', async () => {
    const el = await mount(new GhPopover());
    (el.shadowRoot?.querySelector('.trigger') as HTMLButtonElement).click();
    await el.updateComplete;
    el.shadowRoot
      ?.querySelector('.panel')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await el.updateComplete;
    expect(el.open).toBe(false);
  });
});
