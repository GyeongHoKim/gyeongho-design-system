import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Menu, type MenuItem } from './Menu.js';

const ITEMS: MenuItem[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'delete', label: 'Delete' },
];

describe('Menu', () => {
  it('renders a collapsed trigger with menu semantics', () => {
    render(<Menu label="Actions" items={ITEMS} />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens on click and shows the items', async () => {
    render(<Menu label="Actions" items={ITEMS} />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });

  it('selects an item on click and closes', async () => {
    const onSelect = vi.fn();
    render(<Menu label="Actions" items={ITEMS} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Duplicate' }));
    expect(onSelect).toHaveBeenCalledWith('duplicate');
    expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('opens with ArrowDown and moves focus with arrow keys', async () => {
    render(<Menu label="Actions" items={ITEMS} />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    render(<Menu label="Actions" items={ITEMS} />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  describe('link (href) items', () => {
    const MIXED: MenuItem[] = [
      { value: 'edit', label: 'Edit' },
      { value: 'source', label: 'View source', href: 'https://example.com/source' },
      { value: 'docs', label: 'Docs', href: '/docs', disabled: true },
    ];

    /**
     * Records whether a link click reached the window with its default action
     * intact (i.e. native navigation would proceed), then cancels it so jsdom
     * does not try to navigate.
     */
    function trackNavigation() {
      const navigations: { href: string; prevented: boolean }[] = [];
      const listener = (event: MouseEvent) => {
        const anchor = (event.target as Element | null)?.closest('a');
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
      render(<Menu label="Actions" items={MIXED} />);
      await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
      const link = screen.getByRole('menuitem', { name: 'View source' });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', 'https://example.com/source');
      expect(link.parentElement).toHaveAttribute('role', 'none');
      // Mixed menu: action items stay plain menuitems.
      expect(screen.getByRole('menuitem', { name: 'Edit' }).tagName).toBe('DIV');
      expect(screen.getAllByRole('menuitem')).toHaveLength(3);
    });

    it('a disabled href item has no href and does not navigate', async () => {
      const onSelect = vi.fn();
      render(<Menu label="Actions" items={MIXED} onSelect={onSelect} />);
      const trigger = screen.getByRole('button', { name: 'Actions' });
      await userEvent.click(trigger);
      const link = screen.getByRole('menuitem', { name: 'Docs' });
      expect(link).not.toHaveAttribute('href');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(click);
      expect(click.defaultPrevented).toBe(true);
      expect(onSelect).not.toHaveBeenCalled();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('clicking an href item navigates natively, skips onSelect and closes', async () => {
      const onSelect = vi.fn();
      const nav = trackNavigation();
      render(<Menu label="Actions" items={MIXED} onSelect={onSelect} />);
      const trigger = screen.getByRole('button', { name: 'Actions' });
      await userEvent.click(trigger);
      await userEvent.click(screen.getByRole('menuitem', { name: 'View source' }));
      nav.stop();
      expect(onSelect).not.toHaveBeenCalled();
      expect(nav.navigations).toEqual([{ href: 'https://example.com/source', prevented: false }]);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('action items in a mixed menu still call onSelect', async () => {
      const onSelect = vi.fn();
      render(<Menu label="Actions" items={MIXED} onSelect={onSelect} />);
      await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
      await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
      expect(onSelect).toHaveBeenCalledWith('edit');
    });

    it.each([
      '{Enter}',
      ' ',
    ])('%s on a focused href item navigates without preventDefault', async (key) => {
      const onSelect = vi.fn();
      const nav = trackNavigation();
      render(<Menu label="Actions" items={MIXED} onSelect={onSelect} />);
      const trigger = screen.getByRole('button', { name: 'Actions' });
      trigger.focus();
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{ArrowDown}');
      const link = screen.getByRole('menuitem', { name: 'View source' });
      expect(link).toHaveFocus();
      const keydowns: KeyboardEvent[] = [];
      const onKey = (event: KeyboardEvent) => keydowns.push(event);
      link.addEventListener('keydown', onKey);
      await userEvent.keyboard(key);
      link.removeEventListener('keydown', onKey);
      nav.stop();
      if (key === '{Enter}') {
        // Enter must reach the anchor's native activation untouched.
        expect(keydowns[0]?.defaultPrevented).toBe(false);
      }
      expect(onSelect).not.toHaveBeenCalled();
      expect(nav.navigations).toEqual([{ href: 'https://example.com/source', prevented: false }]);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
