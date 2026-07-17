import type { Meta, StoryObj } from '@storybook/web-components';
import '@ghds/web-components/checkbox-group';
import '@ghds/web-components/checkbox';
import { html } from 'lit';

interface CheckboxGroupArgs {
  label: string;
  layout: 'row' | 'column';
  disabled: boolean;
}

const meta: Meta<CheckboxGroupArgs> = {
  title: 'Components/CheckboxGroup',
  tags: ['autodocs'],
  render: (args) => html`
    <gh-checkbox-group label=${args.label} layout=${args.layout} ?disabled=${args.disabled}>
      <gh-checkbox label="Red" value="red" checked></gh-checkbox>
      <gh-checkbox label="Green" value="green"></gh-checkbox>
      <gh-checkbox label="Blue" value="blue"></gh-checkbox>
    </gh-checkbox-group>
  `,
  args: { label: 'Favorite colors', layout: 'column', disabled: false },
  argTypes: {
    layout: { control: 'inline-radio', options: ['row', 'column'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<CheckboxGroupArgs>;

export const Default: Story = {};

export const Row: Story = { args: { layout: 'row' } };

export const Disabled: Story = { args: { disabled: true } };
