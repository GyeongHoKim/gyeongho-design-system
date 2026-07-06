import { afterEach, describe, expect, it } from 'vitest';
import { GhTooltip } from '../components/tooltip.js';
import { cleanup, mount } from './fixture.js';

async function mountTooltip(): Promise<GhTooltip> {
  const el = new GhTooltip();
  el.content = 'More info';
  const btn = document.createElement('button');
  btn.textContent = 'Help';
  el.append(btn);
  await mount(el);
  await el.updateComplete;
  return el;
}

describe('gh-tooltip', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-tooltip')).toBe(GhTooltip);
  });

  it('renders a role=tooltip bubble with the content', async () => {
    const el = await mountTooltip();
    const bubble = el.shadowRoot?.querySelector('[role="tooltip"]');
    expect(bubble?.textContent).toContain('More info');
  });

  it('reveals on focus and links the trigger via aria-describedby', async () => {
    const el = await mountTooltip();
    el.dispatchEvent(new FocusEvent('focusin'));
    await el.updateComplete;
    expect(el.hasAttribute('open')).toBe(true);
    const trigger = el.querySelector('button');
    const bubbleId = el.shadowRoot?.querySelector('[role="tooltip"]')?.id;
    expect(trigger?.getAttribute('aria-describedby')).toBe(bubbleId);
  });

  it('dismisses on Escape', async () => {
    const el = await mountTooltip();
    el.dispatchEvent(new FocusEvent('focusin'));
    await el.updateComplete;
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await el.updateComplete;
    expect(el.hasAttribute('open')).toBe(false);
  });
});
