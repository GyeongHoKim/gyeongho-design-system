import { afterEach, describe, expect, it } from 'vitest';
import { GhLabel } from '../components/label.js';
import { cleanup, mount } from './fixture.js';

describe('gh-label', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-label')).toBe(GhLabel);
  });

  it('renders a label wrapping slotted content', async () => {
    const el = await mount(new GhLabel());
    el.textContent = 'Email';
    el.for = 'email';
    await el.updateComplete;
    const label = el.shadowRoot?.querySelector('label');
    expect(label?.getAttribute('for')).toBe('email');
  });

  it('focuses the associated control on click', async () => {
    const input = document.createElement('input');
    input.id = 'email';
    document.body.append(input);
    const el = await mount(new GhLabel());
    el.for = 'email';
    await el.updateComplete;
    el.shadowRoot?.querySelector('label')?.click();
    expect(document.activeElement).toBe(input);
  });

  it('does not activate when disabled', async () => {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'agree';
    document.body.append(input);
    const el = await mount(new GhLabel());
    el.for = 'agree';
    el.disabled = true;
    await el.updateComplete;
    el.shadowRoot?.querySelector('label')?.click();
    expect(input.checked).toBe(false);
  });
});
