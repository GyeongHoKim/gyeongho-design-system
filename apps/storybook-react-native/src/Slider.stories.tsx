import { Slider } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  args: {
    label: 'Volume',
    onValueChange: fn(),
  },
  argTypes: {
    disabled: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: 50 } };

export const CustomRange: Story = {
  args: { label: 'Rating', min: 0, max: 10, step: 1, defaultValue: 7 },
};

export const Disabled: Story = { args: { defaultValue: 40, disabled: true } };
