import { Button } from '@ghds/react-native/button';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { label: 'Click me', onPress: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'danger'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Danger: Story = {
  args: { label: 'Delete', variant: 'danger' },
};

export const Disabled: Story = {
  args: { label: 'Unavailable', disabled: true },
};

export const PressInteraction: Story = {
  args: { label: 'Press me' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', { name: 'Press me' });
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalled();
  },
};

export const DisabledDoesNotFire: Story = {
  args: { label: 'No-op', disabled: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', { name: 'No-op' });
    // A disabled react-native-web Pressable sets `pointer-events: none`, which
    // userEvent refuses to click by default. Skip that guard so we can assert
    // the actual behaviour: the press never reaches onPress.
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};
