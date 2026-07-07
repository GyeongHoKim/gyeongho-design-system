import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb.js';

const ITEMS: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Library', href: '/library' },
  { label: 'Data' },
];

describe('Breadcrumb', () => {
  it('exposes a navigation landmark with a default label', () => {
    render(<Breadcrumb items={ITEMS} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders links for all but the last item', () => {
    render(<Breadcrumb items={ITEMS} />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Library' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Data' })).toBeNull();
  });

  it('marks the last item as the current page', () => {
    render(<Breadcrumb items={ITEMS} />);
    expect(screen.getByText('Data')).toHaveAttribute('aria-current', 'page');
  });

  it('fires onSelect when a link is activated', async () => {
    const onSelect = vi.fn();
    render(<Breadcrumb items={ITEMS} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('link', { name: 'Library' }));
    expect(onSelect).toHaveBeenCalledWith(ITEMS[1], 1);
  });
});
