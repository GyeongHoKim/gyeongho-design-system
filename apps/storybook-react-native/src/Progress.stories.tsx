import { Box, Progress } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  args: { value: 60, max: 100, label: 'Uploading' },
  decorators: [
    (Story) => (
      <Box style={{ width: 320 }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Determinate: Story = {};

export const Complete: Story = { args: { value: 100 } };

export const Indeterminate: Story = { args: { value: undefined } };

export const HasProgressbarRole: Story = {
  args: { value: 40, label: 'Upload progress', testID: 'demo-progress' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText('Upload progress')).toBeInTheDocument();
  },
};
