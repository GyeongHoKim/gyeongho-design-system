import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Avatar, type AvatarSize } from './Avatar.js';

const SIZES: AvatarSize[] = ['sm', 'md', 'lg'];

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  args: { name: 'Ada Lovelace' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sys-spacing-sm)' }}>
      {SIZES.map((size) => (
        <Avatar key={size} name="Ada Lovelace" size={size} />
      ))}
    </div>
  ),
};

export const Empty: Story = {
  args: {},
};

export const OnOpaqueSurfaceDark: Story = {
  args: { name: 'Grace Hopper' },
  render: (args) => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Avatar {...args} />
    </div>
  ),
};

export const HasAccessibleName: Story = {
  args: { name: 'Ada Lovelace' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument();
  },
};
