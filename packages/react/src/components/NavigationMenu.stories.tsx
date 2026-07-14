import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationMenu, type NavigationMenuItem } from './NavigationMenu.js';

const ITEMS: NavigationMenuItem[] = [
  { label: 'Home', href: '#', active: true },
  {
    label: 'Products',
    links: [
      { label: 'Analytics', href: '#analytics', description: 'Understand your traffic.' },
      { label: 'Reports', href: '#reports', description: 'Export and share data.' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { label: 'Docs', href: '#docs' },
      { label: 'Guides', href: '#guides' },
    ],
  },
  { label: 'About', href: '#about' },
];

const meta = {
  title: 'Components/NavigationMenu',
  component: NavigationMenu,
} satisfies Meta<typeof NavigationMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { items: ITEMS, 'aria-label': 'Primary' },
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <NavigationMenu items={ITEMS} aria-label="Primary" />
    </div>
  ),
};
