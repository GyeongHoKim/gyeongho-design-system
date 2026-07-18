import '@ghds/web-components/direction';
import '@ghds/web-components/item';
import type { GhDirectionValue } from '@ghds/web-components/direction';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface DirectionArgs {
  dir: GhDirectionValue;
}

const sample = html`
  <gh-item variant="outline" style="display: block;">
    <span slot="media">★</span>
    <span slot="title">Notifications</span>
    <span slot="description">Manage how you receive alerts</span>
    <span slot="actions">›</span>
  </gh-item>
`;

const meta: Meta<DirectionArgs> = {
  title: 'Components/Direction',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-direction dir=${args.dir} style="display: block; max-width: 360px;"
      >${sample}</gh-direction
    >`,
  args: {
    dir: 'ltr',
  },
  argTypes: {
    dir: { control: 'inline-radio', options: ['ltr', 'rtl'] },
  },
};

export default meta;
type Story = StoryObj<DirectionArgs>;

export const LeftToRight: Story = { args: { dir: 'ltr' } };

export const RightToLeft: Story = { args: { dir: 'rtl' } };

export const Dark: Story = {
  args: { dir: 'rtl' },
  render: (args) => html`
    <div data-theme="dark" style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-direction dir=${args.dir} style="display: block; max-width: 360px;">${sample}</gh-direction>
    </div>
  `,
};
