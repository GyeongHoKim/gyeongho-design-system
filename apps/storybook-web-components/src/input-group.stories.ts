import '@ghds/web-components/input-group';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface InputGroupArgs {
  disabled: boolean;
  invalid: boolean;
}

const meta: Meta<InputGroupArgs> = {
  title: 'Components/InputGroup',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-input-group
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
      style="display: block; max-width: 320px;"
    >
      <span style="color: var(--comp-inputGroup-addon-text);">@</span>
      <input placeholder="username" ?disabled=${args.disabled} />
    </gh-input-group>`,
  args: {
    disabled: false,
    invalid: false,
  },
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<InputGroupArgs>;

export const Default: Story = {};

export const Invalid: Story = { args: { invalid: true } };

export const Disabled: Story = { args: { disabled: true } };

export const Dark: Story = {
  render: () => html`
    <div
      data-theme="dark"
      style="display: flex; flex-direction: column; gap: var(--sys-spacing-md); max-width: 320px; background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);"
    >
      <gh-input-group style="display: block;">
        <span style="color: var(--comp-inputGroup-addon-text);">@</span>
        <input placeholder="username" />
      </gh-input-group>
      <gh-input-group invalid style="display: block;">
        <span style="color: var(--comp-inputGroup-addon-text);">@</span>
        <input placeholder="username" />
      </gh-input-group>
    </div>
  `,
};
