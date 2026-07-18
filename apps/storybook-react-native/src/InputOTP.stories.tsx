import { InputOTP } from '@ghds/react-native/input-otp';
import { Box } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from 'storybook/test';

const meta: Meta<typeof InputOTP> = {
  title: 'Components/InputOTP',
  component: InputOTP,
  args: {
    length: 6,
    mode: 'numeric',
    mask: false,
    disabled: false,
    invalid: false,
    onChange: fn(),
  },
  argTypes: {
    length: { control: 'number' },
    mode: { control: 'select', options: ['numeric', 'text'] },
    mask: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof InputOTP>;

export const Numeric: Story = {
  render: (args) => (
    <Box padding="md">
      <InputOTP {...args} />
    </Box>
  ),
};

export const WithLabel: Story = {
  args: { label: 'Verification code', defaultValue: '123' },
  render: (args) => (
    <Box padding="md">
      <InputOTP {...args} />
    </Box>
  ),
};

export const Masked: Story = {
  args: { mask: true, defaultValue: '1234' },
  render: (args) => (
    <Box padding="md">
      <InputOTP {...args} />
    </Box>
  ),
};

export const Invalid: Story = {
  args: { invalid: true, defaultValue: '123456' },
  render: (args) => (
    <Box padding="md">
      <InputOTP {...args} />
    </Box>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: '123' },
  render: (args) => (
    <Box padding="md">
      <InputOTP {...args} />
    </Box>
  ),
};

export const RendersCells: Story = {
  args: { length: 4, testID: 'demo-otp' },
  render: (args) => (
    <Box padding="md">
      <InputOTP {...args} />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText('Digit 1')).toBeInTheDocument();
  },
};
