import '@ghds/web-components/attachment';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface AttachmentArgs {
  name: string;
  meta: string;
  icon: string;
  removable: boolean;
}

const meta: Meta<AttachmentArgs> = {
  title: 'Components/Attachment',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-attachment
      name=${args.name}
      meta=${args.meta}
      icon=${args.icon}
      ?removable=${args.removable}
    ></gh-attachment>`,
  args: {
    name: 'quarterly-report.pdf',
    meta: '2.4 MB',
    icon: 'mail',
    removable: true,
  },
  argTypes: {
    name: { control: 'text' },
    meta: { control: 'text' },
    icon: { control: 'text' },
    removable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<AttachmentArgs>;

export const Default: Story = {};

export const WithoutIcon: Story = { args: { icon: '' } };

export const NotRemovable: Story = { args: { removable: false } };

export const Dark: Story = {
  render: (args) => html`
    <div data-theme="dark" style="display: flex; gap: var(--sys-spacing-md); background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-attachment name=${args.name} meta=${args.meta} icon=${args.icon} removable></gh-attachment>
      <gh-attachment name="notes.txt" meta="1 KB"></gh-attachment>
    </div>
  `,
};
