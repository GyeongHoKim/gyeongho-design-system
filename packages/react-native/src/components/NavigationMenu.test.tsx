import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { NavigationMenu, type NavigationMenuItem } from './NavigationMenu.js';

const ITEMS: NavigationMenuItem[] = [
  {
    value: 'products',
    label: 'Products',
    links: [
      { value: 'analytics', label: 'Analytics' },
      { value: 'crm', label: 'CRM' },
    ],
  },
  { value: 'pricing', label: 'Pricing' },
];

describe('NavigationMenu', () => {
  it('renders the top-level entries', () => {
    renderWithTheme(<NavigationMenu items={ITEMS} accessibilityLabel="Main" testID="nm" />);
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('selects a leaf entry immediately', () => {
    const onSelect = vi.fn();
    renderWithTheme(<NavigationMenu items={ITEMS} onSelect={onSelect} testID="nm" />);
    fireEvent.click(screen.getByTestId('nm-pricing'));
    expect(onSelect).toHaveBeenCalledWith('pricing');
  });

  it('opens a panel for an entry with links and selects a link', () => {
    const onSelect = vi.fn();
    renderWithTheme(<NavigationMenu items={ITEMS} onSelect={onSelect} testID="nm" />);
    expect(screen.queryByText('Analytics')).toBeNull();
    fireEvent.click(screen.getByTestId('nm-products'));
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    fireEvent.click(screen.getByText('CRM'));
    expect(onSelect).toHaveBeenCalledWith('crm');
  });

  it('highlights the active value in dark theme', () => {
    renderWithTheme(<NavigationMenu items={ITEMS} value="pricing" testID="nm" />, darkTheme);
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });
});
