import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/radio-group';
import '@ghds/web-components/radio';
import { html } from 'lit';

interface RadioGroupArgs {
  label: string;
  layout: 'row' | 'column';
  disabled: boolean;
}

const meta: Meta<RadioGroupArgs> = {
  title: 'Components/RadioGroup',
  tags: ['autodocs'],
  render: (args) => html`
    <gh-radio-group label=${args.label} layout=${args.layout} ?disabled=${args.disabled}>
      <gh-radio label="Small" name="size" value="sm" checked></gh-radio>
      <gh-radio label="Medium" name="size" value="md"></gh-radio>
      <gh-radio label="Large" name="size" value="lg"></gh-radio>
    </gh-radio-group>
  `,
  args: { label: 'Size', layout: 'column', disabled: false },
  argTypes: {
    layout: { control: 'inline-radio', options: ['row', 'column'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<RadioGroupArgs>;

export const Default: Story = {};

export const Row: Story = { args: { layout: 'row' } };

export const Disabled: Story = { args: { disabled: true } };
