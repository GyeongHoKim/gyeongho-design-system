import '@ghds/web-components/message-scroller';
import '@ghds/web-components/message';
import '@ghds/web-components/bubble';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface MessageScrollerArgs {
  stickToBottom: boolean;
}

const lines = [
  'Morning!',
  'Did you see the new sketchy components?',
  'They look hand-drawn — love it.',
  'The bubbles wobble but stay stable on re-render.',
  'Scroll up to read history…',
  '…and it pins back to the newest message.',
  'Ship it. 🚀',
];

const conversation = html`
  ${lines.map(
    (line, i) => html`<gh-message side=${i % 2 === 0 ? 'received' : 'sent'}>
      <span slot="author">${i % 2 === 0 ? 'Ada' : 'You'}</span>
      <gh-bubble variant=${i % 2 === 0 ? 'received' : 'sent'}>${line}</gh-bubble>
    </gh-message>`,
  )}
`;

const meta: Meta<MessageScrollerArgs> = {
  title: 'Components/MessageScroller',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-message-scroller
      ?stick-to-bottom=${args.stickToBottom}
      style="display: block; max-height: 240px; max-width: 420px;"
    >
      ${conversation}
    </gh-message-scroller>`,
  args: {
    stickToBottom: true,
  },
  argTypes: {
    stickToBottom: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<MessageScrollerArgs>;

export const Default: Story = {};

export const Dark: Story = {
  render: (args) => html`
    <div data-theme="dark" style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-message-scroller
        ?stick-to-bottom=${args.stickToBottom}
        style="display: block; max-height: 240px; max-width: 420px;"
      >
        ${conversation}
      </gh-message-scroller>
    </div>
  `,
};
