import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ghds/web-components';
import type { GhSkeletonVariant } from '@ghds/web-components';

interface SkeletonArgs {
  variant: GhSkeletonVariant;
  width: string;
  height: string;
}

const meta: Meta<SkeletonArgs> = {
  title: 'Components/Skeleton',
  tags: ['autodocs'],
  render: (args) => html`
    <div style="width: 320px;">
      <gh-skeleton variant=${args.variant} width=${args.width} height=${args.height}></gh-skeleton>
    </div>
  `,
  args: { variant: 'rect', width: '', height: '80px' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['rect', 'text', 'circle'] },
    width: { control: 'text' },
    height: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<SkeletonArgs>;

export const Rect: Story = {};

export const Text: Story = {
  render: () => html`
    <div style="width: 320px; display: flex; flex-direction: column; gap: var(--sys-spacing-sm);">
      <gh-skeleton variant="text"></gh-skeleton>
      <gh-skeleton variant="text" width="80%"></gh-skeleton>
      <gh-skeleton variant="text" width="60%"></gh-skeleton>
    </div>
  `,
};

export const Circle: Story = {
  render: () => html`<gh-skeleton variant="circle"></gh-skeleton>`,
};
