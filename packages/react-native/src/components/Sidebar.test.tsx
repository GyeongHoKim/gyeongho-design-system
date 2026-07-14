import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { darkTheme, renderWithTheme } from '../test-utils.js';
import { Text } from '../theme/primitives.js';
import { Sidebar, type SidebarSection } from './Sidebar.js';

const SECTIONS: SidebarSection[] = [
  {
    title: 'Main',
    items: [
      { value: 'home', label: 'Home', icon: 'home' },
      { value: 'search', label: 'Search', icon: 'search' },
    ],
  },
  {
    title: 'Account',
    items: [{ value: 'profile', label: 'Profile', icon: 'user', disabled: true }],
  },
];

describe('Sidebar', () => {
  it('renders sections, titles and items', () => {
    renderWithTheme(<Sidebar sections={SECTIONS} accessibilityLabel="Nav" testID="sb" />);
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('marks the active item and fires onSelect', () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <Sidebar sections={SECTIONS} activeValue="home" onSelect={onSelect} testID="sb" />,
    );
    expect(screen.getByTestId('sb-home')).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByTestId('sb-search'));
    expect(onSelect).toHaveBeenCalledWith('search');
  });

  it('does not select a disabled item', () => {
    const onSelect = vi.fn();
    renderWithTheme(<Sidebar sections={SECTIONS} onSelect={onSelect} testID="sb" />);
    fireEvent.click(screen.getByTestId('sb-profile'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders header and footer in dark theme', () => {
    renderWithTheme(
      <Sidebar
        sections={SECTIONS}
        header={<Text>Logo</Text>}
        footer={<Text>v2.0</Text>}
        testID="sb"
      />,
      darkTheme,
    );
    expect(screen.getByText('Logo')).toBeInTheDocument();
    expect(screen.getByText('v2.0')).toBeInTheDocument();
  });
});
