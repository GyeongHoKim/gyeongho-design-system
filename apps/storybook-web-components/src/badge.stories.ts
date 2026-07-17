import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/badge';
import type { GhBadgeVariant } from '@ghds/web-components/badge';
import { html } from 'lit';

const VARIANTS: GhBadgeVariant[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];

interface BadgeArgs {
  variant: GhBadgeVariant;
  label: string;
  text: string;
}

const meta: Meta<BadgeArgs> = {
  title: 'Components/Badge',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-badge variant=${args.variant} label=${args.label}>${args.text}</gh-badge>`,
  args: {
    variant: 'neutral',
    label: '',
    text: 'Badge',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    label: { control: 'text' },
    text: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<BadgeArgs>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; gap: var(--sys-spacing-sm); flex-wrap: wrap;">
      ${VARIANTS.map((variant) => html`<gh-badge variant=${variant}>${variant}</gh-badge>`)}
    </div>
  `,
};
