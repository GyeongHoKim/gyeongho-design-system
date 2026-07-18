import { Bubble } from '@ghds/react-native/bubble';
import { Box } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof Bubble> = {
  title: 'Components/Bubble',
  component: Bubble,
  args: { variant: 'received' },
  argTypes: {
    variant: { control: 'select', options: ['received', 'sent'] },
  },
};

export default meta;
type Story = StoryObj<typeof Bubble>;

export const Received: Story = {
  render: (args) => (
    <Box padding="md" alignItems="flex-start">
      <Bubble {...args}>Hey, are we still on for tomorrow?</Bubble>
    </Box>
  ),
};

export const Sent: Story = {
  args: { variant: 'sent' },
  render: (args) => (
    <Box padding="md" alignItems="flex-end">
      <Bubble {...args}>Absolutely — see you at 10.</Bubble>
    </Box>
  ),
};

export const Conversation: Story = {
  render: () => (
    <Box padding="md" gap="sm">
      <Box alignItems="flex-start">
        <Bubble variant="received">Morning!</Bubble>
      </Box>
      <Box alignItems="flex-end">
        <Bubble variant="sent">Morning — coffee?</Bubble>
      </Box>
    </Box>
  ),
};

export const RendersContent: Story = {
  args: { testID: 'demo-bubble' },
  render: (args) => (
    <Box padding="md" alignItems="flex-start">
      <Bubble {...args}>Inside the bubble</Bubble>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Inside the bubble')).toBeInTheDocument();
  },
};
