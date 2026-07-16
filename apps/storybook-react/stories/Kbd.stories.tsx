import { Kbd } from '@ghds/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
} satisfies Meta<typeof Kbd>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Enter' },
};

export const Combo: Story = {
  render: () => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sys-spacing-xs)' }}>
      <Kbd>Ctrl</Kbd>
      <span>+</span>
      <Kbd>K</Kbd>
    </span>
  ),
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sys-spacing-xs)' }}>
        <Kbd>Cmd</Kbd>
        <Kbd>S</Kbd>
      </span>
    </div>
  ),
};
