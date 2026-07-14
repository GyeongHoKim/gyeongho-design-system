import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhCommand } from '../components/command.js';
import { cleanup, mount } from './fixture.js';

const ITEMS = [
  { value: 'new', label: 'New File', group: 'File', keywords: ['create'] },
  { value: 'open', label: 'Open File', group: 'File' },
  { value: 'settings', label: 'Settings', group: 'App' },
];

async function mountPalette(): Promise<GhCommand> {
  const el = await mount(new GhCommand());
  el.items = ITEMS;
  el.open = true;
  await el.updateComplete;
  return el;
}

function search(el: GhCommand): HTMLInputElement {
  return el.shadowRoot?.querySelector('.search') as HTMLInputElement;
}

describe('gh-command', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-command')).toBe(GhCommand);
  });

  it('renders a combobox search and grouped options', async () => {
    const el = await mountPalette();
    expect(search(el).getAttribute('role')).toBe('combobox');
    expect(el.shadowRoot?.querySelectorAll('[role="option"]').length).toBe(3);
    expect(el.shadowRoot?.querySelectorAll('.group-label').length).toBe(2);
  });

  it('filters by label and keywords', async () => {
    const el = await mountPalette();
    const field = search(el);
    field.value = 'create';
    field.dispatchEvent(new Event('input'));
    await el.updateComplete;
    const options = el.shadowRoot?.querySelectorAll('[role="option"]');
    expect(options?.length).toBe(1);
    expect(options?.[0]?.textContent?.trim()).toBe('New File');
  });

  it('runs the highlighted command on Enter and requests close', async () => {
    const el = await mountPalette();
    const command = vi.fn();
    const close = vi.fn();
    el.addEventListener('command', command);
    el.addEventListener('close', close);
    const dialog = el.shadowRoot?.querySelector('dialog') as HTMLElement;
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await el.updateComplete;
    expect((command.mock.calls[0][0] as CustomEvent<string>).detail).toBe('open');
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('shows the empty message when nothing matches', async () => {
    const el = await mountPalette();
    const field = search(el);
    field.value = 'zzzz';
    field.dispatchEvent(new Event('input'));
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.empty')?.textContent).toContain('No results');
  });
});
