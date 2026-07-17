import { Breadcrumb, type BreadcrumbItem } from '@ghds/react-native/breadcrumb';
import type { Meta, StoryObj } from '@storybook/react';

const ITEMS: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Components', href: '/components' },
  { label: 'Breadcrumb' },
];

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  args: { items: ITEMS },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {};

export const TwoLevels: Story = {
  args: { items: [{ label: 'Home', href: '/' }, { label: 'Settings' }] },
};
