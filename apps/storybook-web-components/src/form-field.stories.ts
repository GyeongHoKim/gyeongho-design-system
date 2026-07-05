import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface FormFieldArgs {
  label: string;
  helperText: string;
  error: string;
}

/**
 * `<gh-form-field>` auto-wires `id`/`aria-describedby`/`aria-invalid` onto its
 * slotted control by reaching into its own light-DOM child directly (no
 * `id`/`aria-*` attributes need to be set by hand on the `<input>` below). A
 * plain native `<input>` is used here (rather than `<gh-input>`) simply
 * because it's the simplest control to demonstrate the wrapper with.
 */
const meta: Meta<FormFieldArgs> = {
  title: 'Components/FormField',
  tags: ['autodocs'],
  render: (args) => html`
    <gh-form-field
      for="email"
      label=${args.label}
      helper-text=${args.helperText}
      error=${args.error}
      style="width: 320px;"
    >
      <input
        type="email"
        placeholder="you@example.com"
        style="width: 100%; box-sizing: border-box; padding: var(--sys-spacing-sm) var(--sys-spacing-md); border: var(--sys-border-width-default) solid var(--sys-color-border-default); border-radius: var(--sys-radius-md); font-family: var(--sys-typography-body-fontFamily); font-size: var(--sys-typography-body-fontSize);"
      />
    </gh-form-field>
  `,
  args: { label: 'Email', helperText: '', error: '' },
};

export default meta;
type Story = StoryObj<FormFieldArgs>;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: { helperText: "We'll never share your email." },
};

export const WithError: Story = {
  args: { error: 'Please enter a valid email' },
};

export const HelperAndErrorTogether: Story = {
  args: { helperText: "We'll never share your email.", error: 'Please enter a valid email' },
};
