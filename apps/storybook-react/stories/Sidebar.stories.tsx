import { Sidebar, type SidebarSection } from '@ghds/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const SECTIONS: SidebarSection[] = [
  {
    heading: 'Main',
    items: [
      { value: 'home', label: 'Home', icon: 'home' },
      { value: 'search', label: 'Search', icon: 'search' },
      { value: 'starred', label: 'Starred', icon: 'star' },
    ],
  },
  {
    heading: 'Account',
    items: [
      { value: 'profile', label: 'Profile', icon: 'user' },
      { value: 'mail', label: 'Messages', icon: 'mail' },
    ],
  },
];

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

function Demo({ collapsed }: { collapsed?: boolean }) {
  const [active, setActive] = useState('home');
  return (
    <div style={{ height: 360, display: 'flex' }}>
      <Sidebar
        sections={SECTIONS}
        activeValue={active}
        onSelect={setActive}
        defaultCollapsed={collapsed}
        aria-label="Primary"
      />
    </div>
  );
}

export const Expanded: Story = { render: () => <Demo /> };
export const Collapsed: Story = { render: () => <Demo collapsed /> };

export const OnDarkSurface: Story = {
  render: () => (
    <div data-theme="dark" style={{ background: 'var(--sys-color-bg-canvas)' }}>
      <Demo />
    </div>
  ),
};
