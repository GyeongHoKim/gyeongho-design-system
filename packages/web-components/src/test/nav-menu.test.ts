import { afterEach, describe, expect, it, vi } from 'vitest';
import { GhNavMenu, type GhNavMenuItem } from '../components/nav-menu.js';
import { cleanup, mount, setSize } from './fixture.js';

const ITEMS: GhNavMenuItem[] = [
  { href: '/design-style/', label: 'Design Style' },
  { href: '/foundations/', label: 'Foundations' },
  { href: '/principles/', label: 'Design Principles' },
  { href: '/ux-writing/', label: 'UX Writing' },
];

async function mountNavMenu(): Promise<GhNavMenu> {
  const el = await mount(new GhNavMenu());
  el.items = ITEMS;
  el.label = 'Design';
  await el.updateComplete;
  return el;
}

function trigger(el: GhNavMenu): HTMLButtonElement {
  return el.shadowRoot?.querySelector('.trigger') as HTMLButtonElement;
}

function panel(el: GhNavMenu): HTMLElement {
  return el.shadowRoot?.querySelector('.panel') as HTMLElement;
}

function links(el: GhNavMenu): HTMLAnchorElement[] {
  return Array.from(el.shadowRoot?.querySelectorAll<HTMLAnchorElement>('.link') ?? []);
}

function isOpen(el: GhNavMenu): boolean {
  return trigger(el).getAttribute('aria-expanded') === 'true';
}

function key(target: EventTarget, k: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key: k,
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

async function openByClick(el: GhNavMenu): Promise<void> {
  trigger(el).click();
  await el.updateComplete;
}

describe('gh-nav-menu', () => {
  afterEach(cleanup);

  it('registers as a custom element', () => {
    expect(customElements.get('gh-nav-menu')).toBe(GhNavMenu);
  });

  it('renders a collapsed disclosure trigger controlling the panel', async () => {
    const el = await mountNavMenu();
    const t = trigger(el);
    expect(t.tagName).toBe('BUTTON');
    expect(t.getAttribute('type')).toBe('button');
    expect(t.getAttribute('aria-expanded')).toBe('false');
    expect(t.getAttribute('aria-controls')).toBe(panel(el).id);
    // A navigation disclosure does not announce a menu popup.
    expect(t.hasAttribute('aria-haspopup')).toBe(false);
    expect(t.textContent).toContain('Design');
    expect(panel(el).classList.contains('open')).toBe(false);
  });

  it('opens on click and closes on a second click', async () => {
    const el = await mountNavMenu();
    await openByClick(el);
    expect(isOpen(el)).toBe(true);
    expect(panel(el).classList.contains('open')).toBe(true);
    await openByClick(el);
    expect(isOpen(el)).toBe(false);
    expect(panel(el).classList.contains('open')).toBe(false);
  });

  it('renders every item as a real <a href> inside a plain list', async () => {
    const el = await mountNavMenu();
    await openByClick(el);
    const anchors = links(el);
    expect(anchors).toHaveLength(4);
    anchors.forEach((a, i) => {
      expect(a.tagName).toBe('A');
      expect(a.getAttribute('href')).toBe(ITEMS[i]?.href);
      expect(a.textContent?.trim()).toBe(ITEMS[i]?.label);
      // Links are in the natural tab order (no roving tabindex).
      expect(a.hasAttribute('tabindex')).toBe(false);
      expect(a.parentElement?.tagName).toBe('LI');
    });
    expect(panel(el).querySelector('ul')?.children).toHaveLength(4);
  });

  it('never renders role="menu" or role="menuitem" (regression guard)', async () => {
    const el = await mountNavMenu();
    const root = el.shadowRoot as ShadowRoot;
    const menuRoles = '[role="menu"], [role="menuitem"], [role="menubar"], [aria-haspopup="menu"]';
    expect(root.querySelectorAll(menuRoles)).toHaveLength(0);
    await openByClick(el);
    expect(root.querySelectorAll(menuRoles)).toHaveLength(0);
    expect(el.querySelectorAll(menuRoles)).toHaveLength(0);
  });

  it('closes on Escape from a link and returns focus to the trigger', async () => {
    const el = await mountNavMenu();
    await openByClick(el);
    links(el)[1]?.focus();
    const event = key(links(el)[1] as HTMLElement, 'Escape');
    await el.updateComplete;
    expect(event.defaultPrevented).toBe(true);
    expect(isOpen(el)).toBe(false);
    expect(el.shadowRoot?.activeElement).toBe(trigger(el));
  });

  it('closes on Escape from the trigger', async () => {
    const el = await mountNavMenu();
    await openByClick(el);
    trigger(el).focus();
    key(trigger(el), 'Escape');
    await el.updateComplete;
    expect(isOpen(el)).toBe(false);
  });

  it('stops Escape at the open component so an enclosing container stays open', async () => {
    const el = await mountNavMenu();
    const onParentKeyDown = vi.fn();
    document.body.addEventListener('keydown', onParentKeyDown);
    await openByClick(el);
    key(trigger(el), 'Escape');
    await el.updateComplete;
    await openByClick(el);
    links(el)[1]?.focus();
    key(links(el)[1] as HTMLElement, 'Escape');
    await el.updateComplete;
    document.body.removeEventListener('keydown', onParentKeyDown);
    expect(isOpen(el)).toBe(false);
    expect(onParentKeyDown).not.toHaveBeenCalled();
  });

  it('closes on an outside pointerdown without stealing focus', async () => {
    const el = await mountNavMenu();
    const outside = document.createElement('button');
    document.body.append(outside);
    await openByClick(el);
    outside.focus();
    outside.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(isOpen(el)).toBe(false);
    expect(document.activeElement).toBe(outside);
  });

  it('stays open on a pointerdown inside the panel', async () => {
    const el = await mountNavMenu();
    await openByClick(el);
    panel(el).dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(isOpen(el)).toBe(true);
  });

  it('ArrowDown on the trigger opens and focuses the first link', async () => {
    const el = await mountNavMenu();
    trigger(el).focus();
    key(trigger(el), 'ArrowDown');
    await el.updateComplete;
    await el.updateComplete;
    expect(isOpen(el)).toBe(true);
    expect(el.shadowRoot?.activeElement).toBe(links(el)[0]);
  });

  it('ArrowUp on the trigger opens and focuses the last link', async () => {
    const el = await mountNavMenu();
    trigger(el).focus();
    key(trigger(el), 'ArrowUp');
    await el.updateComplete;
    await el.updateComplete;
    expect(el.shadowRoot?.activeElement).toBe(links(el)[3]);
  });

  it('Arrow / Home / End move focus between links (wrapping)', async () => {
    const el = await mountNavMenu();
    await openByClick(el);
    const anchors = links(el);
    anchors[0]?.focus();
    key(anchors[0] as HTMLElement, 'ArrowDown');
    expect(el.shadowRoot?.activeElement).toBe(anchors[1]);
    key(anchors[1] as HTMLElement, 'End');
    expect(el.shadowRoot?.activeElement).toBe(anchors[3]);
    key(anchors[3] as HTMLElement, 'ArrowDown');
    expect(el.shadowRoot?.activeElement).toBe(anchors[0]);
    key(anchors[0] as HTMLElement, 'ArrowUp');
    expect(el.shadowRoot?.activeElement).toBe(anchors[3]);
    key(anchors[3] as HTMLElement, 'Home');
    expect(el.shadowRoot?.activeElement).toBe(anchors[0]);
  });

  it('leaves Tab to the browser and closes when focus leaves the component', async () => {
    const el = await mountNavMenu();
    const after = document.createElement('a');
    after.href = '#after';
    document.body.append(after);
    await openByClick(el);
    const last = links(el)[3] as HTMLAnchorElement;
    last.focus();
    const tab = key(last, 'Tab');
    expect(tab.defaultPrevented).toBe(false);
    // Tab past the last link: focus moves outside the component.
    after.focus();
    await el.updateComplete;
    expect(isOpen(el)).toBe(false);
    expect(document.activeElement).toBe(after);
  });

  it('stays open while focus moves between its own links', async () => {
    const el = await mountNavMenu();
    await openByClick(el);
    links(el)[0]?.focus();
    links(el)[1]?.focus();
    await el.updateComplete;
    expect(isOpen(el)).toBe(true);
  });

  it('clicking a link navigates natively and closes the panel', async () => {
    const el = await mountNavMenu();
    await openByClick(el);
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
        event.preventDefault(); // keep jsdom from navigating
      }
    };
    window.addEventListener('click', listener);
    links(el)[2]?.click();
    window.removeEventListener('click', listener);
    await el.updateComplete;
    expect(navigations).toEqual([{ href: '/principles/', prevented: false }]);
    expect(isOpen(el)).toBe(false);
  });

  it('renders the trigger sketch once measured', async () => {
    const el = await mountNavMenu();
    await setSize(el, 120, 40);
    expect(el.shadowRoot?.querySelector('.trigger svg')).not.toBeNull();
  });

  it('removes its document listener when disconnected', async () => {
    const el = await mountNavMenu();
    await openByClick(el);
    const remove = vi.spyOn(document, 'removeEventListener');
    el.remove();
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    remove.mockRestore();
  });

  it('reattaches closed after being removed while open', async () => {
    const el = await mountNavMenu();
    await openByClick(el);
    el.remove();
    document.body.appendChild(el);
    await el.updateComplete;
    expect(isOpen(el)).toBe(false);
    expect(panel(el).classList.contains('open')).toBe(false);
  });

  it('does not anchor the panel when closed before the open render settles', async () => {
    const el = await mountNavMenu();
    const add = vi.spyOn(window, 'addEventListener');
    trigger(el).click();
    trigger(el).click();
    await el.updateComplete;
    await Promise.resolve();
    expect(isOpen(el)).toBe(false);
    expect(add.mock.calls.some(([type]) => type === 'resize' || type === 'scroll')).toBe(false);
    add.mockRestore();
  });

  it('sizes the panel from the comp.menu.panel.minWidth token', () => {
    const cssText = ([GhNavMenu.styles] as unknown[])
      .flat(Infinity)
      .map((r) => (r as { cssText: string }).cssText)
      .join('\n');
    expect(cssText).toContain('min-width: var(--comp-menu-panel-minWidth)');
    expect(cssText).not.toMatch(/min-width:\s*\d/);
  });
});
