import { afterEach, describe, expect, it } from 'vitest';
import { GhBubble } from '../components/bubble.js';
import { cleanup, mount, setSize } from './fixture.js';

describe('gh-bubble', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-bubble')).toBe(GhBubble);
  });

  it('renders slotted content inside the bubble box', async () => {
    const el = await mount(new GhBubble());
    el.textContent = 'Hello there';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.bubble .content slot')).not.toBeNull();
    expect(el.textContent).toContain('Hello there');
  });

  it('defaults to the received variant and reflects sent', async () => {
    const el = await mount(new GhBubble());
    expect(el.variant).toBe('received');
    el.variant = 'sent';
    await el.updateComplete;
    expect(el.getAttribute('variant')).toBe('sent');
  });

  it('draws the sketch border box once measured', async () => {
    const el = await mount(new GhBubble());
    await setSize(el, 180, 44);
    expect(el.shadowRoot?.querySelectorAll('path.sketch-stroke').length ?? 0).toBeGreaterThan(0);
  });
});
