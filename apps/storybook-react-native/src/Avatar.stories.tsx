import { Avatar, type AvatarSize } from '@ghds/react-native/avatar';
import { Box } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const SIZES: AvatarSize[] = ['sm', 'md', 'lg'];

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  args: { name: 'Ada Lovelace', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: SIZES } },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = {};

export const Sizes: Story = {
  render: () => (
    <Box flexDirection="row" alignItems="center" gap="sm">
      {SIZES.map((size) => (
        <Avatar key={size} name="Ada Lovelace" size={size} />
      ))}
    </Box>
  ),
};

export const HasAccessibleName: Story = {
  args: { name: 'Ada Lovelace', testID: 'demo-avatar' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('AL')).toBeInTheDocument();
  },
};
