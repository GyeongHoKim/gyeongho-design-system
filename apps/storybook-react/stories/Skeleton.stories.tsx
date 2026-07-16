import { Skeleton } from '@ghds/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  argTypes: {
    variant: { control: 'inline-radio', options: ['rect', 'text', 'circle'] },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Rect: Story = {
  args: { variant: 'rect', height: 80 },
};

export const Text: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-spacing-sm)' }}>
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </div>
  ),
};

export const Circle: Story = {
  args: { variant: 'circle' },
};

/** A card-shaped placeholder cluster — the common real-world usage. */
export const CardPlaceholder: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--sys-spacing-md)', alignItems: 'center' }}>
      <Skeleton variant="circle" />
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sys-spacing-sm)' }}
      >
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  ),
};

export const OnOpaqueSurfaceDark: Story = {
  args: { variant: 'rect', height: 80 },
  render: (args) => (
    <div
      data-theme="dark"
      style={{
        width: 320,
        background: 'var(--sys-color-bg-surface)',
        padding: 'var(--sys-spacing-lg)',
      }}
    >
      <Skeleton {...args} />
    </div>
  ),
};
