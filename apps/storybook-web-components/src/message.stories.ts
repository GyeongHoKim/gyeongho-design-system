import '@ghds/web-components/message';
import '@ghds/web-components/bubble';
import '@ghds/web-components/avatar';
import type { GhMessageSide } from '@ghds/web-components/message';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface MessageArgs {
  side: GhMessageSide;
}

function sample(side: GhMessageSide) {
  return html`<gh-message side=${side} style="max-width: 420px;">
    <gh-avatar slot="avatar" name="Ada Lovelace" size="sm"></gh-avatar>
    <span slot="author">Ada Lovelace</span>
    <span slot="timestamp">10:24</span>
    <gh-bubble variant=${side === 'sent' ? 'sent' : 'received'}>
      The Analytical Engine weaves algebraic patterns.
    </gh-bubble>
  </gh-message>`;
}

const meta: Meta<MessageArgs> = {
  title: 'Components/Message',
  tags: ['autodocs'],
  render: (args) => sample(args.side),
  args: {
    side: 'received',
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['received', 'sent'] },
  },
};

export default meta;
type Story = StoryObj<MessageArgs>;

export const Received: Story = { args: { side: 'received' } };

export const Sent: Story = { args: { side: 'sent' } };

export const Conversation: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: var(--sys-spacing-lg);">
      ${sample('received')} ${sample('sent')}
    </div>
  `,
};

export const Dark: Story = {
  render: () => html`
    <div data-theme="dark" style="display: flex; flex-direction: column; gap: var(--sys-spacing-lg); background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      ${sample('received')} ${sample('sent')}
    </div>
  `,
};
