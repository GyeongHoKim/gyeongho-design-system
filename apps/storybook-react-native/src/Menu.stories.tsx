import { Menu, type MenuItem } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';

const ITEMS: MenuItem[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'archive', label: 'Archive', disabled: true },
  { value: 'delete', label: 'Delete' },
];

const meta: Meta<typeof Menu> = {
  title: 'Components/Menu',
  component: Menu,
  args: { label: 'Actions', items: ITEMS },
};

export default meta;
type Story = StoryObj<typeof Menu>;

export const Default: Story = {};
