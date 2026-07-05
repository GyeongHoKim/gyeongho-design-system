import { Select } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

const FRUIT_OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  args: {
    label: 'Fruit',
    placeholder: 'Choose a fruit',
    options: FRUIT_OPTIONS,
    onValueChange: fn(),
  },
  argTypes: {
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const Selected: Story = { args: { value: 'banana' } };

export const Disabled: Story = { args: { value: 'banana', disabled: true } };

export const PressInteraction: Story = {
  args: { testID: 'fruit-select' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByTestId('fruit-select');
    await userEvent.click(trigger);
    const option = await within(document.body).findByText('Banana');
    await userEvent.click(option);
    await expect(args.onValueChange).toHaveBeenCalledWith('banana');
  },
};
