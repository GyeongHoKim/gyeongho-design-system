import { Box, Skeleton } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: { variant: 'rect', height: 80 },
  argTypes: { variant: { control: 'inline-radio', options: ['rect', 'text', 'circle'] } },
  decorators: [
    (Story) => (
      <Box style={{ width: 320 }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Rect: Story = {};

export const Text: Story = {
  render: () => (
    <Box gap="sm">
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </Box>
  ),
};

export const Circle: Story = { args: { variant: 'circle' } };

export const CardPlaceholder: Story = {
  render: () => (
    <Box flexDirection="row" gap="md" alignItems="center">
      <Skeleton variant="circle" />
      <Box flex={1} gap="sm">
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" />
      </Box>
    </Box>
  ),
};
