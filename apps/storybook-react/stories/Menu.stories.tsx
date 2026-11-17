import { Menu, type MenuItem } from '@ghds/react/menu';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

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

const WITH_LINKS: MenuItem[] = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'source', label: 'View source on GitHub', href: 'https://github.com/' },
  { value: 'docs', label: 'Read the docs', href: '#docs' },
];

/** Action items mixed with `href` items, which render as real `<a role="menuitem">` links. */
export const WithLinks: Story = {
  args: { items: WITH_LINKS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    const link = canvas.getByRole('menuitem', { name: 'View source on GitHub' });
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('href', 'https://github.com/');
  },
};

export const Opens: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    await expect(canvas.getAllByRole('menuitem')).toHaveLength(4);
  },
};
