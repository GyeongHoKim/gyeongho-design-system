import { Radio } from '@ghds/react-native/radio';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  args: { label: 'Small', value: 'sm', onCheckedChange: fn() },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true } };

export const PressInteraction: Story = {
  args: { label: 'Toggle me', testID: 'radio' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await canvas.findByTestId('radio');
    await userEvent.click(field);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};
