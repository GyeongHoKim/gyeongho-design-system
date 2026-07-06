import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import '@ghds/web-components';
import type { GhAvatarSize } from '@ghds/web-components';

const SIZES: GhAvatarSize[] = ['sm', 'md', 'lg'];

interface AvatarArgs {
  size: GhAvatarSize;
  name: string;
  src: string;
  alt: string;
}

const meta: Meta<AvatarArgs> = {
  title: 'Components/Avatar',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-avatar size=${args.size} name=${args.name} src=${args.src} alt=${args.alt}></gh-avatar>`,
  args: { size: 'md', name: 'Ada Lovelace', src: '', alt: '' },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
    name: { control: 'text' },
    src: { control: 'text' },
    alt: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<AvatarArgs>;

export const Initials: Story = {};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: var(--sys-spacing-sm);">
      ${SIZES.map((size) => html`<gh-avatar size=${size} name="Ada Lovelace"></gh-avatar>`)}
    </div>
  `,
};

export const Empty: Story = {
  args: { name: '' },
};
