import { Textarea } from '@ghds/react-native/textarea';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  args: { label: 'Bio', placeholder: 'Tell us about yourself', onChangeText: fn() },
  argTypes: {
    disabled: { control: 'boolean' },
    autoResize: { control: 'boolean' },
    rows: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: 'Hello GHDS' },
};

export const Disabled: Story = {
  args: { value: 'Read only', disabled: true },
};

export const AutoResize: Story = {
  args: {
    label: 'Message',
    autoResize: true,
    value: 'This textarea grows to fit its content.\nAdd more lines and watch it expand.',
  },
};

export const TypeInteraction: Story = {
  args: { label: 'Notes', testID: 'notes-textarea' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await canvas.findByTestId('notes-textarea');
    await userEvent.type(field, 'hi@ghds.dev');
    await expect(args.onChangeText).toHaveBeenCalled();
  },
};
