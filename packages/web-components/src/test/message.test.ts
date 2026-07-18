import { afterEach, describe, expect, it } from 'vitest';
import { GhMessage } from '../components/message.js';
import { cleanup, mount } from './fixture.js';

describe('gh-message', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-message')).toBe(GhMessage);
  });

  it('exposes avatar, author, timestamp and default content slots', async () => {
    const el = await mount(new GhMessage());
    const names = [...(el.shadowRoot?.querySelectorAll('slot') ?? [])].map((s) =>
      s.getAttribute('name'),
    );
    expect(names).toContain('avatar');
    expect(names).toContain('author');
    expect(names).toContain('timestamp');
    // The default (unnamed) content slot is present.
    expect(names).toContain(null);
  });

  it('defaults to the received side, reflected', async () => {
    const el = await mount(new GhMessage());
    expect(el.side).toBe('received');
    expect(el.getAttribute('side')).toBe('received');
  });

  it('reflects the sent side (used to flip the row direction)', async () => {
    const el = await mount(new GhMessage());
    el.side = 'sent';
    await el.updateComplete;
    expect(el.getAttribute('side')).toBe('sent');
  });

  it('renders slotted content', async () => {
    const el = await mount(new GhMessage());
    el.innerHTML = '<span slot="author">Ada</span><gh-bubble>Hi</gh-bubble>';
    await el.updateComplete;
    expect(el.textContent).toContain('Ada');
    expect(el.textContent).toContain('Hi');
  });
});
