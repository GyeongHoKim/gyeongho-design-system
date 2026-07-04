import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Switch } from './Switch.js';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { label: 'Enable notifications' },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const On: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledOn: Story = {
  args: { disabled: true, defaultChecked: true },
};

/**
 * Visual-regression guard for GHD-44: the switch sits inside an
 * opaque-background container. If its control loses its stacking context, the
 * `z-index: -1` sketch track paints behind this box and disappears — flagged
 * by Chromatic in both light and dark schemes.
 */
export const OnOpaqueSurface: Story = {
  args: { label: 'On an opaque surface', defaultChecked: true },
  render: (args) => (
    <div style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}>
      <Switch {...args} />
    </div>
  ),
};

export const OnOpaqueSurfaceDark: Story = {
  args: { label: 'On a dark opaque surface', defaultChecked: true },
  render: (args) => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Switch {...args} />
    </div>
  ),
};

export const KeyboardInteraction: Story = {
  args: { label: 'Toggle me' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('switch', { name: 'Toggle me' });
    await userEvent.tab();
    await expect(field).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(field).toHaveAttribute('aria-checked', 'true');
  },
};
