import '@ghds/web-components/item';
import type { GhItemVariant } from '@ghds/web-components/item';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const VARIANTS: GhItemVariant[] = ['default', 'muted', 'outline'];

interface ItemArgs {
  variant: GhItemVariant;
  selected: boolean;
}

const meta: Meta<ItemArgs> = {
  title: 'Components/Item',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-item
      variant=${args.variant}
      ?selected=${args.selected}
      style="display: block; max-width: 360px;"
    >
      <span slot="media">★</span>
      <span slot="title">Notifications</span>
      <span slot="description">Manage how you receive alerts</span>
      <span slot="actions">›</span>
    </gh-item>`,
  args: {
    variant: 'outline',
    selected: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    selected: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<ItemArgs>;

export const Outline: Story = { args: { variant: 'outline' } };

export const Muted: Story = { args: { variant: 'muted' } };

export const Selected: Story = { args: { variant: 'default', selected: true } };

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: var(--sys-spacing-sm); max-width: 360px;">
      ${VARIANTS.map(
        (variant) => html`<gh-item variant=${variant} style="display: block;">
          <span slot="media">★</span>
          <span slot="title">${variant}</span>
          <span slot="description">Variant ${variant}</span>
          <span slot="actions">›</span>
        </gh-item>`,
      )}
    </div>
  `,
};

export const Dark: Story = {
  render: () => html`
    <div
      data-theme="dark"
      style="display: flex; flex-direction: column; gap: var(--sys-spacing-sm); max-width: 360px; background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);"
    >
      ${VARIANTS.map(
        (variant) => html`<gh-item variant=${variant} style="display: block;">
          <span slot="media">★</span>
          <span slot="title">${variant}</span>
          <span slot="description">Variant ${variant}</span>
          <span slot="actions">›</span>
        </gh-item>`,
      )}
      <gh-item selected style="display: block;">
        <span slot="media">★</span>
        <span slot="title">selected</span>
        <span slot="description">Selected row</span>
        <span slot="actions">›</span>
      </gh-item>
    </div>
  `,
};
