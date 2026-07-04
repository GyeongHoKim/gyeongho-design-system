import { Checkbox } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { label: 'Subscribe to updates', onCheckedChange: fn() },
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = { args: { indeterminate: true } };

export const Disabled: Story = { args: { disabled: true } };

export const PressInteraction: Story = {
  args: { label: 'Toggle me', testID: 'checkbox' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await canvas.findByTestId('checkbox');
    await userEvent.click(field);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};
