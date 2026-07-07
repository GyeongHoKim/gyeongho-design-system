import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components';
import type { GhBreadcrumbItem } from '@ghds/web-components';

const ITEMS: GhBreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Components', href: '/components' },
  { label: 'Breadcrumb' },
];

const meta: Meta = {
  title: 'Components/Breadcrumb',
  tags: ['autodocs'],
  render: () => {
    const el = document.createElement('gh-breadcrumb');
    (el as HTMLElement & { items: GhBreadcrumbItem[] }).items = ITEMS;
    return el;
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const TwoLevels: Story = {
  render: () => {
    const el = document.createElement('gh-breadcrumb');
    (el as HTMLElement & { items: GhBreadcrumbItem[] }).items = [
      { label: 'Home', href: '/' },
      { label: 'Settings' },
    ];
    return el;
  },
};
