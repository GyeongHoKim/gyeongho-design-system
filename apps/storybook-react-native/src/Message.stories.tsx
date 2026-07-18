import { Avatar } from '@ghds/react-native/avatar';
import { Bubble } from '@ghds/react-native/bubble';
import {
  Message,
  MessageAuthor,
  MessageAvatar,
  MessageContent,
  MessageTimestamp,
} from '@ghds/react-native/message';
import { Box } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof Message> = {
  title: 'Components/Message',
  component: Message,
  args: { side: 'received' },
  argTypes: {
    side: { control: 'select', options: ['received', 'sent'] },
  },
};

export default meta;
type Story = StoryObj<typeof Message>;

export const Received: Story = {
  render: (args) => (
    <Box width={320} padding="md">
      <Message {...args}>
        <MessageAvatar>
          <Avatar name="Ada Lovelace" size="sm" />
        </MessageAvatar>
        <MessageContent>
          <Box flexDirection="row" gap="sm" alignItems="center">
            <MessageAuthor>Ada</MessageAuthor>
            <MessageTimestamp>09:41</MessageTimestamp>
          </Box>
          <Bubble variant="received">Did you see the new sketch theme?</Bubble>
        </MessageContent>
      </Message>
    </Box>
  ),
};

export const Sent: Story = {
  args: { side: 'sent' },
  render: (args) => (
    <Box width={320} padding="md">
      <Message {...args}>
        <MessageAvatar>
          <Avatar name="You" size="sm" />
        </MessageAvatar>
        <MessageContent>
          <Box flexDirection="row" gap="sm" alignItems="center">
            <MessageAuthor>You</MessageAuthor>
            <MessageTimestamp>09:42</MessageTimestamp>
          </Box>
          <Bubble variant="sent">Just did — love it.</Bubble>
        </MessageContent>
      </Message>
    </Box>
  ),
};

export const RendersContent: Story = {
  args: { testID: 'demo-message' },
  render: (args) => (
    <Box width={320} padding="md">
      <Message {...args}>
        <MessageContent>
          <MessageAuthor>Grace</MessageAuthor>
          <Bubble variant="received">Shipping it.</Bubble>
        </MessageContent>
      </Message>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Grace')).toBeInTheDocument();
  },
};
