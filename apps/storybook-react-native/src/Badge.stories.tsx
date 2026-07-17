import { Badge, type BadgeVariant } from '@ghds/react-native/badge';
import { Box } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const VARIANTS: BadgeVariant[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  args: { variant: 'neutral', children: 'Badge' },
  argTypes: { variant: { control: 'inline-radio', options: VARIANTS } },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <Box flexDirection="row" flexWrap="wrap" gap="sm">
      {VARIANTS.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </Box>
  ),
};

export const RendersLabel: Story = {
  args: { testID: 'demo-badge', variant: 'success', children: 'Done' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Done')).toBeInTheDocument();
  },
};
