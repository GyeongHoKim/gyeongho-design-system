import '@ghds/web-components/input-otp';
import type { GhInputOtpMode } from '@ghds/web-components/input-otp';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface InputOtpArgs {
  length: number;
  value: string;
  mode: GhInputOtpMode;
  mask: boolean;
  disabled: boolean;
  invalid: boolean;
  label: string;
}

const meta: Meta<InputOtpArgs> = {
  title: 'Components/InputOTP',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-input-otp
      .length=${args.length}
      .value=${args.value}
      mode=${args.mode}
      ?mask=${args.mask}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
      label=${args.label}
    ></gh-input-otp>`,
  args: {
    length: 6,
    value: '',
    mode: 'numeric',
    mask: false,
    disabled: false,
    invalid: false,
    label: 'Verification code',
  },
  argTypes: {
    length: { control: { type: 'number', min: 1, max: 10 } },
    value: { control: 'text' },
    mode: { control: 'inline-radio', options: ['numeric', 'text'] },
    mask: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<InputOtpArgs>;

export const Empty: Story = {};

export const Filled: Story = { args: { value: '123456' } };

export const Masked: Story = { args: { value: '123456', mask: true } };

export const Invalid: Story = { args: { value: '1234', invalid: true } };

export const Disabled: Story = { args: { value: '123', disabled: true } };

export const Dark: Story = {
  args: { value: '1234' },
  render: (args) => html`
    <div data-theme="dark" style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-input-otp
        .length=${args.length}
        .value=${args.value}
        mode=${args.mode}
        label=${args.label}
      ></gh-input-otp>
    </div>
  `,
};
