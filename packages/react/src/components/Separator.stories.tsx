import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from './Separator.js';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <p style={{ margin: 0 }}>Above</p>
      <Separator />
      <p style={{ margin: 0 }}>Below</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--sys-spacing-md)', height: 48 }}
    >
      <span>Left</span>
      <Separator orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{
        background: 'var(--sys-color-bg-surface)',
        padding: 'var(--sys-spacing-lg)',
        width: 240,
      }}
    >
      <p style={{ margin: 0, color: 'var(--sys-color-text-primary)' }}>Above</p>
      <Separator />
      <p style={{ margin: 0, color: 'var(--sys-color-text-primary)' }}>Below</p>
    </div>
  ),
};
