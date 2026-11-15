import { act, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NavMenu, type NavMenuItem } from './NavMenu.js';

const ITEMS: NavMenuItem[] = [
  { href: '/design-style/', label: 'Design Style' },
  { href: '/foundations/', label: 'Foundations' },
  { href: '/principles/', label: 'Design Principles' },
  { href: '/ux-writing/', label: 'UX Writing' },
];

const MENU_ROLES = '[role="menu"], [role="menuitem"], [role="menubar"], [aria-haspopup="menu"]';

function renderNavMenu() {
  const utils = render(
    <>
      <NavMenu label="Design" items={ITEMS} />
      <a href="#after">After</a>
    </>,
  );
  const trigger = screen.getByRole('button', { name: 'Design' });
  return { ...utils, trigger };
}

describe('NavMenu', () => {
  it('renders a collapsed disclosure trigger controlling the panel', () => {
    const { trigger } = renderNavMenu();
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const panelId = trigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId ?? '')).not.toBeNull();
    expect(trigger).not.toHaveAttribute('aria-haspopup');
    // Closed: the links are hidden from the accessibility tree.
    expect(screen.queryByRole('link', { name: 'Foundations' })).toBeNull();
  });

  it('opens on click and closes on a second click', async () => {
    const { trigger } = renderNavMenu();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('list')).toBeVisible();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders every item as a real <a href> inside a plain list', async () => {
    const { trigger } = renderNavMenu();
    await userEvent.click(trigger);
    const list = screen.getByRole('list');
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(4);
    ITEMS.forEach((item, i) => {
      const link = screen.getByRole('link', { name: item.label });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', item.href);
      expect(link).not.toHaveAttribute('tabindex');
      expect(listItems[i]).toContainElement(link);
    });
    expect(list.tagName).toBe('UL');
  });

  it('never renders role="menu" or role="menuitem" (regression guard)', async () => {
    const { container, trigger } = renderNavMenu();
    expect(container.querySelectorAll(MENU_ROLES)).toHaveLength(0);
    await userEvent.click(trigger);
    expect(container.querySelectorAll(MENU_ROLES)).toHaveLength(0);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
  });

  it('closes on Escape from a link and returns focus to the trigger', async () => {
    const { trigger } = renderNavMenu();
    await userEvent.click(trigger);
    act(() => screen.getByRole('link', { name: 'Foundations' }).focus());
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes on Escape from the trigger', async () => {
    const { trigger } = renderNavMenu();
    await userEvent.click(trigger);
    expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('stops Escape at the open panel so an enclosing container stays open', async () => {
    const onParentKeyDown = vi.fn();
    render(
      // biome-ignore lint/a11y/noStaticElementInteractions: test-only Escape listener
      <div onKeyDown={onParentKeyDown}>
        <NavMenu label="Design" items={ITEMS} />
      </div>,
    );
    const trigger = screen.getByRole('button', { name: 'Design' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    act(() => screen.getByRole('link', { name: 'Foundations' }).focus());
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onParentKeyDown).not.toHaveBeenCalled();
  });

  it('closes on an outside click', async () => {
    const { trigger } = renderNavMenu();
    await userEvent.click(trigger);
    await userEvent.click(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('stays open on a pointerdown inside the panel', async () => {
    const { trigger } = renderNavMenu();
    await userEvent.click(trigger);
    fireEvent.pointerDown(screen.getByRole('list'));
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('ArrowDown on the trigger opens and focuses the first link', async () => {
    const { trigger } = renderNavMenu();
    act(() => trigger.focus());
    await userEvent.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Design Style' })).toHaveFocus();
  });

  it('ArrowUp on the trigger opens and focuses the last link', async () => {
    const { trigger } = renderNavMenu();
    act(() => trigger.focus());
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('link', { name: 'UX Writing' })).toHaveFocus();
  });

  it('Arrow / Home / End move focus between links (wrapping)', async () => {
    const { trigger } = renderNavMenu();
    act(() => trigger.focus());
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: 'Foundations' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('link', { name: 'UX Writing' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('link', { name: 'Design Style' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('link', { name: 'UX Writing' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('link', { name: 'Design Style' })).toHaveFocus();
  });

  it('Tab moves through the links natively and closes once focus leaves', async () => {
    const { trigger } = renderNavMenu();
    await userEvent.click(trigger);
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Design Style' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'Foundations' })).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'UX Writing' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'After' })).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('clicking a link navigates natively and closes the panel', async () => {
    const { trigger } = renderNavMenu();
    await userEvent.click(trigger);
    const link = screen.getByRole('link', { name: 'Design Principles' });
    let prevented: boolean | undefined;
    const listener = (event: MouseEvent) => {
      prevented = event.defaultPrevented;
      event.preventDefault(); // keep jsdom from navigating
    };
    window.addEventListener('click', listener);
    await userEvent.click(link);
    window.removeEventListener('click', listener);
    expect(prevented).toBe(false);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('highlights a link on hover with the comp.menu highlight colour', async () => {
    const { trigger } = renderNavMenu();
    await userEvent.click(trigger);
    const link = screen.getByRole('link', { name: 'Foundations' });
    const before = link.style.background;
    await userEvent.hover(link);
    expect(link.style.background).not.toBe(before);
    expect(link.style.background).toContain('--comp-menu-item-bg-highlighted');
    await userEvent.unhover(link);
    expect(link.style.background).toBe(before);
  });

  it('forwards its ref to the trigger button', () => {
    let node: HTMLButtonElement | null = null;
    render(
      <NavMenu
        ref={(el) => {
          node = el;
        }}
        label="Design"
        items={ITEMS}
      />,
    );
    expect(node).toBe(screen.getByRole('button', { name: 'Design' }));
  });
});
