import { Avatar } from '@ghds/react/avatar';
import { Bubble } from '@ghds/react/bubble';
import {
  Message,
  MessageAuthor,
  MessageAvatar,
  MessageContent,
  MessageTimestamp,
} from '@ghds/react/message';
import { MessageScroller } from '@ghds/react/message-scroller';
import type { Meta, StoryObj } from '@storybook/react-vite';

const LINES = [
  'Hey — are we still on for tomorrow?',
  'Yes! See you at 10.',
  'Should I bring anything?',
  'Just the slides, I think.',
  "Great, I'll print a few copies.",
  'Perfect. Coffee on me.',
  'Deal. See you then!',
  'One more thing — which room?',
  'The one on the third floor.',
  'Got it. Thanks!',
];

/** One alternating chat row. */
function Row({ text, index }: { text: string; index: number }) {
  const sent = index % 2 === 1;
  return (
    <Message side={sent ? 'sent' : 'received'}>
      <MessageAvatar>
        <Avatar name={sent ? 'Me' : 'Bo Ram'} />
      </MessageAvatar>
      <MessageContent style={sent ? { alignItems: 'flex-end' } : undefined}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sys-spacing-xs)' }}>
          <MessageAuthor>{sent ? 'You' : 'Bo Ram'}</MessageAuthor>
          <MessageTimestamp>10:0{index}</MessageTimestamp>
        </div>
        <Bubble variant={sent ? 'sent' : 'received'}>{text}</Bubble>
      </MessageContent>
    </Message>
  );
}

const meta = {
  title: 'Components/MessageScroller',
  component: MessageScroller,
  argTypes: {
    stickToBottom: { control: 'boolean' },
  },
  args: { stickToBottom: true, style: { maxHeight: 320, maxWidth: 480 } },
} satisfies Meta<typeof MessageScroller>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <MessageScroller {...args}>
      {LINES.map((text, i) => (
        <Row key={text} text={text} index={i} />
      ))}
    </MessageScroller>
  ),
};

/** Visual-regression guard: the bounded log + themed scrollbar on a dark surface. */
export const OnOpaqueSurfaceDark: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <MessageScroller style={{ maxHeight: 320, maxWidth: 480 }}>
        {LINES.map((text, i) => (
          <Row key={text} text={text} index={i} />
        ))}
      </MessageScroller>
    </div>
  ),
};
