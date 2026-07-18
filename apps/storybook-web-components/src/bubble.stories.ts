import '@ghds/web-components/bubble';
import type { GhBubbleVariant } from '@ghds/web-components/bubble';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface BubbleArgs {
  variant: GhBubbleVariant;
  text: string;
}

const meta: Meta<BubbleArgs> = {
  title: 'Components/Bubble',
  tags: ['autodocs'],
  render: (args) => html`<gh-bubble variant=${args.variant}>${args.text}</gh-bubble>`,
  args: {
    variant: 'received',
    text: 'Hey! Are we still on for tomorrow?',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['received', 'sent'] },
    text: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<BubbleArgs>;

export const Received: Story = { args: { variant: 'received' } };

export const Sent: Story = { args: { variant: 'sent' } };

export const Conversation: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: var(--sys-spacing-sm); align-items: flex-start; max-width: 320px;">
      <gh-bubble variant="received">Hey! Are we still on for tomorrow?</gh-bubble>
      <gh-bubble variant="sent" style="align-self: flex-end;">Absolutely — 10am works.</gh-bubble>
    </div>
  `,
};

export const Dark: Story = {
  render: () => html`
    <div data-theme="dark" style="display: flex; flex-direction: column; gap: var(--sys-spacing-sm); align-items: flex-start; max-width: 320px; background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-bubble variant="received">Hey! Are we still on for tomorrow?</gh-bubble>
      <gh-bubble variant="sent" style="align-self: flex-end;">Absolutely — 10am works.</gh-bubble>
    </div>
  `,
};
