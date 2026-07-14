import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NavigationMenu, type NavigationMenuItem } from './NavigationMenu.js';

const ITEMS: NavigationMenuItem[] = [
  { label: 'Home', href: '/', active: true },
  {
    label: 'Products',
    links: [
      { label: 'Analytics', href: '/analytics' },
      { label: 'Reports', href: '/reports' },
    ],
  },
  { label: 'About', href: '/about' },
];

describe('NavigationMenu', () => {
  it('renders a labelled nav with links and disclosure triggers', () => {
    render(<NavigationMenu items={ITEMS} aria-label="Primary" />);
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('button', { name: /Products/ })).toHaveAttribute(
      'aria-haspopup',
      'menu',
    );
  });

  it('opens the dropdown panel on click', async () => {
    render(<NavigationMenu items={ITEMS} aria-label="Primary" />);
    const trigger = screen.getByRole('button', { name: /Products/ });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Analytics' })).toHaveAttribute(
      'href',
      '/analytics',
    );
  });
});
