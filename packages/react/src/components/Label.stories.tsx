import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from './Label.js';

const meta = {
  title: 'Components/Label',
  component: Label,
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Email address' },
};

export const WithControl: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-spacing-xs)' }}>
      <Label htmlFor="story-input">Email address</Label>
      <input id="story-input" style={{ padding: 'var(--sys-spacing-sm)' }} />
    </div>
  ),
};

export const Disabled: Story = {
  args: { children: 'Email address', disabled: true },
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Label>Email address</Label>
    </div>
  ),
};
