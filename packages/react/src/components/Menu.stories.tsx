import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Menu, type MenuItem } from './Menu.js';

const ITEMS: MenuItem[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'archive', label: 'Archive', disabled: true },
  { value: 'delete', label: 'Delete' },
];

const meta = {
  title: 'Components/Menu',
  component: Menu,
  args: { label: 'Actions', items: ITEMS },
  decorators: [
    (Story) => (
      <div style={{ padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Dark: Story = {
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ background: 'var(--sys-color-bg-canvas)', padding: 24 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    await expect(canvas.getAllByRole('menuitem')).toHaveLength(4);
  },
};

export const Opens: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    await expect(canvas.getAllByRole('menuitem')).toHaveLength(4);
  },
};
