import { FormField } from '@ghds/react-native/form-field';
import { Input } from '@ghds/react-native/input';
import { Textarea } from '@ghds/react-native/textarea';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  args: { label: 'Email' },
  render: (args) => (
    <FormField {...args}>
      <Input testID="email" placeholder="you@example.com" />
    </FormField>
  ),
};

export default meta;
type Story = StoryObj<typeof FormField>;

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

/**
 * `Textarea` already renders its own label — `FormField`'s `label` is
 * omitted here to avoid a purely-visual doubled label.
 */
export const WrappingTextarea: Story = {
  args: { label: undefined, helperText: 'Tell us about yourself' },
  render: (args) => (
    <FormField {...args}>
      <Textarea label="Bio" testID="bio" />
    </FormField>
  ),
};
