import { Switch } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: { label: 'Enable notifications', onCheckedChange: fn() },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {};

export const On: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true } };

export const PressInteraction: Story = {
  args: { label: 'Toggle me', testID: 'switch' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await canvas.findByTestId('switch');
    await userEvent.click(field);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
  },
};
