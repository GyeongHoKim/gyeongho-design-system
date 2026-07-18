import { Avatar } from '@ghds/react/avatar';
import { Bubble } from '@ghds/react/bubble';
import {
  Message,
  MessageAuthor,
  MessageAvatar,
  MessageContent,
  MessageTimestamp,
} from '@ghds/react/message';
import type { Meta, StoryObj } from '@storybook/react-vite';

/** The author + timestamp header shown above a bubble. */
function Header({ author, time }: { author: string; time: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sys-spacing-xs)' }}>
      <MessageAuthor>{author}</MessageAuthor>
      <MessageTimestamp>{time}</MessageTimestamp>
    </div>
  );
}

const meta = {
  title: 'Components/Message',
  component: Message,
  argTypes: {
    side: { control: 'inline-radio', options: ['received', 'sent'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Message>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Received: Story = {
  render: () => (
    <Message side="received">
      <MessageAvatar>
        <Avatar name="Bo Ram" />
      </MessageAvatar>
      <MessageContent>
        <Header author="Bo Ram" time="10:02" />
        <Bubble variant="received">Hey — are we still on for tomorrow?</Bubble>
      </MessageContent>
    </Message>
  ),
};

export const Sent: Story = {
  render: () => (
    <Message side="sent">
      <MessageAvatar>
        <Avatar name="Me" />
      </MessageAvatar>
      <MessageContent style={{ alignItems: 'flex-end' }}>
        <Header author="You" time="10:03" />
        <Bubble variant="sent">Yes! See you at 10.</Bubble>
      </MessageContent>
    </Message>
  ),
};

export const Conversation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sys-spacing-md)' }}>
      <Message side="received">
        <MessageAvatar>
          <Avatar name="Bo Ram" />
        </MessageAvatar>
        <MessageContent>
          <Header author="Bo Ram" time="10:02" />
          <Bubble variant="received">Hey — are we still on for tomorrow?</Bubble>
        </MessageContent>
      </Message>
      <Message side="sent">
        <MessageAvatar>
          <Avatar name="Me" />
        </MessageAvatar>
        <MessageContent style={{ alignItems: 'flex-end' }}>
          <Header author="You" time="10:03" />
          <Bubble variant="sent">Yes! See you at 10.</Bubble>
        </MessageContent>
      </Message>
      <Message side="received">
        <MessageAvatar>
          <Avatar name="Bo Ram" />
        </MessageAvatar>
        <MessageContent>
          <Header author="Bo Ram" time="10:03" />
          <Bubble variant="received">Perfect — I'll bring the slides.</Bubble>
        </MessageContent>
      </Message>
    </div>
  ),
};

/** Visual-regression guard: message rows + bubbles on an opaque dark surface. */
export const OnOpaqueSurfaceDark: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{
        background: 'var(--sys-color-bg-surface)',
        padding: 'var(--sys-spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sys-spacing-md)',
        maxWidth: 480,
      }}
    >
      <Message side="received">
        <MessageAvatar>
          <Avatar name="Bo Ram" />
        </MessageAvatar>
        <MessageContent>
          <Header author="Bo Ram" time="10:02" />
          <Bubble variant="received">Hey — are we still on for tomorrow?</Bubble>
        </MessageContent>
      </Message>
      <Message side="sent">
        <MessageAvatar>
          <Avatar name="Me" />
        </MessageAvatar>
        <MessageContent style={{ alignItems: 'flex-end' }}>
          <Header author="You" time="10:03" />
          <Bubble variant="sent">Yes! See you at 10.</Bubble>
        </MessageContent>
      </Message>
    </div>
  ),
};
