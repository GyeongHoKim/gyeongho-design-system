import { Input } from '@ghds/react-native/input';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  args: { placeholder: 'Type here…', onChangeText: fn() },
  argTypes: { disabled: { control: 'boolean' } },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: 'Hello GHDS' },
};

export const Disabled: Story = {
  args: { value: 'Read only', disabled: true },
};

export const TypeInteraction: Story = {
  args: { placeholder: 'Email', testID: 'email-input' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await canvas.findByPlaceholderText('Email');
    await userEvent.type(field, 'hi@ghds.dev');
    await expect(args.onChangeText).toHaveBeenCalled();
  },
};
