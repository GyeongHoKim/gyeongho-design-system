import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/progress';
import { html } from 'lit';

interface ProgressArgs {
  value?: number;
  max: number;
  label: string;
}

const meta: Meta<ProgressArgs> = {
  title: 'Components/Progress',
  tags: ['autodocs'],
  render: (args) => html`
    <div style="width: 320px;">
      <gh-progress
        value=${args.value ?? ''}
        max=${args.max}
        label=${args.label}
      ></gh-progress>
    </div>
  `,
  args: { value: 60, max: 100, label: 'Uploading' },
  argTypes: {
    value: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<ProgressArgs>;

export const Determinate: Story = {};

export const Complete: Story = { args: { value: 100 } };

export const Indeterminate: Story = {
  args: { value: undefined },
  render: (args) => html`
    <div style="width: 320px;">
      <gh-progress label=${args.label}></gh-progress>
    </div>
  `,
};
