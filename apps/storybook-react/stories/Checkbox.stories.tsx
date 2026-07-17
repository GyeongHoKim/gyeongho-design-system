import { Checkbox } from '@ghds/react/checkbox';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { label: 'Subscribe to updates' },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};

/**
 * Visual-regression guard for GHD-44: the checkbox sits inside an
 * opaque-background container. If its control loses its stacking context, the
 * `z-index: -1` sketch box paints behind this box and disappears — flagged by
 * Chromatic in both light and dark schemes.
 */
export const OnOpaqueSurface: Story = {
  args: { label: 'On an opaque surface', defaultChecked: true },
  render: (args) => (
    <div style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}>
      <Checkbox {...args} />
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
      <Checkbox {...args} />
    </div>
  ),
};

export const KeyboardInteraction: Story = {
  args: { label: 'Toggle me' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText('Toggle me');
    await userEvent.tab();
    await expect(field).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(field).toBeChecked();
  },
};
