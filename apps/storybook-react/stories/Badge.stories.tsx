import { Badge, type BadgeVariant } from '@ghds/react/badge';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const VARIANTS: BadgeVariant[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];

const meta = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Badge' },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--sys-spacing-sm)', flexWrap: 'wrap' }}>
      {VARIANTS.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

/**
 * Visual-regression guard for GHD-44: on an opaque surface the `z-index: -1`
 * sketch fill must stay scoped to the badge in both light and dark schemes.
 */
export const OnOpaqueSurface: Story = {
  args: { variant: 'primary', children: 'On surface' },
  render: (args) => (
    <div style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}>
      <Badge {...args} />
    </div>
  ),
};

export const OnOpaqueSurfaceDark: Story = {
  args: { variant: 'primary', children: 'On surface' },
  render: (args) => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Badge {...args} />
    </div>
  ),
};

export const AsStatus: Story = {
  args: { variant: 'danger', role: 'status', 'aria-label': '3 errors', children: '3' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status', { name: '3 errors' })).toBeInTheDocument();
  },
};
