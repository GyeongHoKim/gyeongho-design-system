import '@ghds/web-components/native-select';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface NativeSelectArgs {
  label: string;
  disabled: boolean;
  invalid: boolean;
}

const options = html`
  <option value="">Select a fruit…</option>
  <option value="apple">Apple</option>
  <option value="banana">Banana</option>
  <option value="cherry">Cherry</option>
`;

const meta: Meta<NativeSelectArgs> = {
  title: 'Components/NativeSelect',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-native-select
      label=${args.label}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
      style="min-width: 240px;"
    >
      <select>${options}</select>
    </gh-native-select>`,
  args: {
    label: 'Fruit',
    disabled: false,
    invalid: false,
  },
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<NativeSelectArgs>;

export const Default: Story = {};

export const Invalid: Story = { args: { invalid: true } };

export const Disabled: Story = { args: { disabled: true } };

export const Dark: Story = {
  render: () => html`
    <div
      data-theme="dark"
      style="display: flex; flex-direction: column; gap: var(--sys-spacing-md); background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);"
    >
      <gh-native-select label="Fruit" style="min-width: 240px;">
        <select>${options}</select>
      </gh-native-select>
      <gh-native-select label="Fruit" invalid style="min-width: 240px;">
        <select>${options}</select>
      </gh-native-select>
    </div>
  `,
};
