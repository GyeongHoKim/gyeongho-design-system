import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormField } from './FormField.js';
import { Input } from './Input.js';
import { Textarea } from './Textarea.js';

const meta = {
  title: 'Components/FormField',
  component: FormField,
  args: { label: 'Email' },
  render: (args) => (
    <FormField {...args}>
      <Input />
    </FormField>
  ),
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

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

export const WrappingTextarea: Story = {
  args: { label: 'Bio', helperText: 'Tell us about yourself' },
  render: (args) => (
    <FormField {...args}>
      <Textarea />
    </FormField>
  ),
};
