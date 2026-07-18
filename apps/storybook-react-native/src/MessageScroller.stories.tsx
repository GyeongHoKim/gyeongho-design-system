import { Bubble } from '@ghds/react-native/bubble';
import { MessageScroller } from '@ghds/react-native/message-scroller';
import { Box } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof MessageScroller> = {
  title: 'Components/MessageScroller',
  component: MessageScroller,
  args: { stickToBottom: true },
  argTypes: { stickToBottom: { control: 'boolean' } },
};

export default meta;
type Story = StoryObj<typeof MessageScroller>;

const LINES = Array.from({ length: 12 }, (_, i) => `Message ${i + 1}`);

export const Default: Story = {
  render: (args) => (
    <Box width={320} height={280}>
      <MessageScroller {...args}>
        {LINES.map((line, index) => (
          <Box key={line} alignItems={index % 2 === 0 ? 'flex-start' : 'flex-end'}>
            <Bubble variant={index % 2 === 0 ? 'received' : 'sent'}>{line}</Bubble>
          </Box>
        ))}
      </MessageScroller>
    </Box>
  ),
};

export const RendersContent: Story = {
  args: { testID: 'demo-scroller' },
  render: (args) => (
    <Box width={320} height={200}>
      <MessageScroller {...args}>
        <Box alignItems="flex-start">
          <Bubble variant="received">First</Bubble>
        </Box>
        <Box alignItems="flex-end">
          <Bubble variant="sent">Last</Bubble>
        </Box>
      </MessageScroller>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('First')).toBeInTheDocument();
  },
};
