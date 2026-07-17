import { Radio } from '@ghds/react/radio';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Components/Radio',
  component: Radio,
  args: { label: 'Small', value: 'sm' },
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/**
 * Visual-regression guard for GHD-44: the radio sits inside an
 * opaque-background container. If its control loses its stacking context, the
 * `z-index: -1` sketch ring paints behind this box and disappears — flagged by
 * Chromatic in both light and dark schemes.
 */
export const OnOpaqueSurface: Story = {
  args: { label: 'On an opaque surface', defaultChecked: true },
  render: (args) => (
    <div style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}>
      <Radio {...args} />
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
      <Radio {...args} />
    </div>
  ),
};

export const KeyboardInteraction: Story = {
  args: { label: 'Toggle me', value: 'toggle' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText('Toggle me');
    await userEvent.tab();
    await expect(field).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(field).toBeChecked();
  },
};
