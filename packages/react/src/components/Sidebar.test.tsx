import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar, type SidebarSection } from './Sidebar.js';

const SECTIONS: SidebarSection[] = [
  {
    heading: 'Main',
    items: [
      { value: 'home', label: 'Home', icon: 'home' },
      { value: 'search', label: 'Search', icon: 'search' },
    ],
  },
  {
    heading: 'Account',
    items: [{ value: 'profile', label: 'Profile', icon: 'user' }],
  },
];

describe('Sidebar', () => {
  it('renders a labelled nav with items', () => {
    render(<Sidebar sections={SECTIONS} aria-label="Primary" />);
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
  });

  it('marks the active item with aria-current', () => {
    render(<Sidebar sections={SECTIONS} activeValue="search" />);
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('fires onSelect when an item is clicked', async () => {
    const onSelect = vi.fn();
    render(<Sidebar sections={SECTIONS} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Profile' }));
    expect(onSelect).toHaveBeenCalledWith('profile');
  });

  it('toggles collapsed state (uncontrolled)', async () => {
    render(<Sidebar sections={SECTIONS} aria-label="Primary" />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(nav).toHaveAttribute('data-collapsed', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(nav).toHaveAttribute('data-collapsed', 'true');
  });

  it('respects the controlled collapsed prop', () => {
    render(<Sidebar sections={SECTIONS} collapsed aria-label="Primary" />);
    expect(screen.getByRole('navigation', { name: 'Primary' })).toHaveAttribute(
      'data-collapsed',
      'true',
    );
    // Collapsed items expose their label via aria-label instead of visible text.
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
  });
});
