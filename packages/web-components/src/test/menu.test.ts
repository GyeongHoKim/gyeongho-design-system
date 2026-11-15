import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhMenu, type GhMenuItem } from '../components/menu.js';
import { cleanup, mount } from './fixture.js';

const ITEMS = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'delete', label: 'Delete' },
];

async function mountMenu(): Promise<GhMenu> {
  const el = await mount(new GhMenu());
  el.items = ITEMS;
  el.label = 'Actions';
  await el.updateComplete;
  return el;
}

describe('gh-menu', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-menu')).toBe(GhMenu);
  });

  it('renders a collapsed trigger with menu semantics', async () => {
    const el = await mountMenu();
    const trigger = el.shadowRoot?.querySelector('.trigger');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens on click and renders menuitems', async () => {
    const el = await mountMenu();
    (el.shadowRoot?.querySelector('.trigger') as HTMLButtonElement).click();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.trigger')?.getAttribute('aria-expanded')).toBe('true');
    expect(el.shadowRoot?.querySelectorAll('[role="menuitem"]').length).toBe(3);
  });

  it('dispatches select with the item value and closes', async () => {
    const el = await mountMenu();
    (el.shadowRoot?.querySelector('.trigger') as HTMLButtonElement).click();
    await el.updateComplete;
    const handler = vi.fn();
    el.addEventListener('select', handler);
    (el.shadowRoot?.querySelectorAll('[role="menuitem"]')[1] as HTMLElement).click();
    await el.updateComplete;
    expect((handler.mock.calls[0][0] as CustomEvent<string>).detail).toBe('duplicate');
    expect(el.shadowRoot?.querySelector('.trigger')?.getAttribute('aria-expanded')).toBe('false');
  });

  describe('link (href) items', () => {
    const MIXED: GhMenuItem[] = [
      { value: 'edit', label: 'Edit' },
      { value: 'source', label: 'View source', href: 'https://example.com/source' },
      { value: 'docs', label: 'Docs', href: '/docs', disabled: true },
    ];

    async function mountOpenMixed(): Promise<GhMenu> {
      const el = await mount(new GhMenu());
      el.items = MIXED;
      el.label = 'Actions';
      await el.updateComplete;
      (el.shadowRoot?.querySelector('.trigger') as HTMLButtonElement).click();
      await el.updateComplete;
      return el;
    }

    function menuitems(el: GhMenu): HTMLElement[] {
      return Array.from(el.shadowRoot?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    }

    /**
     * Records whether a link click reached the window with its default action
     * intact (i.e. native navigation would proceed), then cancels it so jsdom
     * does not try to navigate.
     */
    function trackNavigation() {
      const navigations: { href: string; prevented: boolean }[] = [];
      const listener = (event: MouseEvent) => {
        const anchor = event
          .composedPath()
          .find((n): n is HTMLAnchorElement => n instanceof HTMLAnchorElement);
        if (anchor) {
          navigations.push({
            href: anchor.getAttribute('href') ?? '',
            prevented: event.defaultPrevented,
          });
          event.preventDefault();
        }
      };
      window.addEventListener('click', listener);
      return { navigations, stop: () => window.removeEventListener('click', listener) };
    }

    it('renders an href item as a real anchor inside a role="none" wrapper', async () => {
      const el = await mountOpenMixed();
      const [edit, source] = menuitems(el);
      expect(source?.tagName).toBe('A');
      expect(source?.getAttribute('href')).toBe('https://example.com/source');
      expect(source?.parentElement?.getAttribute('role')).toBe('none');
      // Mixed menu: action items stay plain menuitems.
      expect(edit?.tagName).toBe('DIV');
      expect(menuitems(el)).toHaveLength(3);
    });

    it('a disabled href item has no href and does not navigate', async () => {
      const el = await mountOpenMixed();
      const handler = vi.fn();
      el.addEventListener('select', handler);
      const docs = menuitems(el)[2];
      expect(docs?.hasAttribute('href')).toBe(false);
      expect(docs?.getAttribute('aria-disabled')).toBe('true');
      const click = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
      docs?.dispatchEvent(click);
      await el.updateComplete;
      expect(click.defaultPrevented).toBe(true);
      expect(handler).not.toHaveBeenCalled();
      expect(el.shadowRoot?.querySelector('.trigger')?.getAttribute('aria-expanded')).toBe('true');
    });

    it('clicking an href item navigates natively, skips select and closes', async () => {
      const el = await mountOpenMixed();
      const handler = vi.fn();
      el.addEventListener('select', handler);
      const nav = trackNavigation();
      menuitems(el)[1]?.click();
      nav.stop();
      await el.updateComplete;
      expect(handler).not.toHaveBeenCalled();
      expect(nav.navigations).toEqual([{ href: 'https://example.com/source', prevented: false }]);
      expect(el.shadowRoot?.querySelector('.trigger')?.getAttribute('aria-expanded')).toBe('false');
    });

    it('action items in a mixed menu still dispatch select', async () => {
      const el = await mountOpenMixed();
      const handler = vi.fn();
      el.addEventListener('select', handler);
      menuitems(el)[0]?.click();
      expect((handler.mock.calls[0]?.[0] as CustomEvent<string>).detail).toBe('edit');
    });

    it('Enter on a focused href item is not preventDefault-ed and skips select', async () => {
      const el = await mountOpenMixed();
      const handler = vi.fn();
      el.addEventListener('select', handler);
      const panel = el.shadowRoot?.querySelector('.panel') as HTMLElement;
      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await el.updateComplete;
      const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      menuitems(el)[1]?.dispatchEvent(enter);
      // The browser turns an unprevented Enter on a focused <a href> into a click.
      expect(enter.defaultPrevented).toBe(false);
      expect(handler).not.toHaveBeenCalled();
    });

    it('Space on a focused href item activates the link and closes', async () => {
      const el = await mountOpenMixed();
      const handler = vi.fn();
      el.addEventListener('select', handler);
      const panel = el.shadowRoot?.querySelector('.panel') as HTMLElement;
      panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await el.updateComplete;
      const nav = trackNavigation();
      menuitems(el)[1]?.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }),
      );
      nav.stop();
      await el.updateComplete;
      expect(handler).not.toHaveBeenCalled();
      expect(nav.navigations).toEqual([{ href: 'https://example.com/source', prevented: false }]);
      expect(el.shadowRoot?.querySelector('.trigger')?.getAttribute('aria-expanded')).toBe('false');
    });

    it('hovering an item moves focus to it, so keyboard activation targets the focused item', async () => {
      const el = await mountOpenMixed();
      const handler = vi.fn();
      el.addEventListener('select', handler);
      await el.updateComplete;
      const [edit, source] = menuitems(el);
      // Keyboard focus starts on the first item ("Edit")…
      expect(el.shadowRoot?.activeElement).toBe(edit);
      // …then the mouse moves over the link item.
      source?.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;
      await el.updateComplete;
      expect(el.shadowRoot?.activeElement).toBe(source);
      // Reverse: hovering an action item moves focus back off the link, so
      // Enter runs the action rather than suppressing the link's native Enter.
      edit?.dispatchEvent(new MouseEvent('mouseenter'));
      await el.updateComplete;
      await el.updateComplete;
      expect(el.shadowRoot?.activeElement).toBe(edit);
      const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      edit?.dispatchEvent(enter);
      expect(enter.defaultPrevented).toBe(true);
      expect((handler.mock.calls[0]?.[0] as CustomEvent<string>).detail).toBe('edit');
    });

    it('an item with an empty href is a plain action item', async () => {
      const el = await mount(new GhMenu());
      el.items = [{ value: 'reload', label: 'Reload', href: '' }];
      el.label = 'Actions';
      await el.updateComplete;
      (el.shadowRoot?.querySelector('.trigger') as HTMLButtonElement).click();
      await el.updateComplete;
      const handler = vi.fn();
      el.addEventListener('select', handler);
      const [item] = menuitems(el);
      expect(item?.tagName).toBe('DIV');
      expect(item?.hasAttribute('href')).toBe(false);
      const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      item?.dispatchEvent(enter);
      expect(enter.defaultPrevented).toBe(true);
      expect((handler.mock.calls[0]?.[0] as CustomEvent<string>).detail).toBe('reload');
    });
  });

  it('sizes the panel from the comp.menu.panel.minWidth token', () => {
    const cssText = ([GhMenu.styles] as unknown[])
      .flat(Infinity)
      .map((r) => (r as { cssText: string }).cssText)
      .join('\n');
    expect(cssText).toContain('min-width: var(--comp-menu-panel-minWidth)');
    expect(cssText).not.toMatch(/min-width:\s*\d/);
  });
});
