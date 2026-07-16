import { Icon, Toggle } from '@ghds/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Toggle',
  component: Toggle,
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Bold' },
};

export const Pressed: Story = {
  args: { children: 'Bold', defaultPressed: true },
};

export const Disabled: Story = {
  args: { children: 'Bold', disabled: true },
};

export const WithIcon: Story = {
  render: () => (
    <Toggle defaultPressed aria-label="Favourite">
      <Icon name="star" size="sm" />
    </Toggle>
  ),
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <div style={{ display: 'flex', gap: 'var(--sys-spacing-sm)' }}>
        <Toggle>Off</Toggle>
        <Toggle defaultPressed>On</Toggle>
      </div>
    </div>
  ),
};
