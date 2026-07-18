import { NativeSelect } from '@ghds/react-native/native-select';
import { Box } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from 'storybook/test';

const meta: Meta<typeof NativeSelect> = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
  args: {
    items: [
      { label: 'Red', value: 'red' },
      { label: 'Green', value: 'green' },
      { label: 'Blue', value: 'blue' },
    ],
    onValueChange: fn(),
  },
  argTypes: { disabled: { control: 'boolean' } },
};

export default meta;
type Story = StoryObj<typeof NativeSelect>;

export const Default: Story = {
  render: (args) => (
    <Box width={280} padding="md">
      <NativeSelect {...args} label="Favourite colour" placeholder="Choose a colour" />
    </Box>
  ),
};

export const Selected: Story = {
  render: (args) => (
    <Box width={280} padding="md">
      <NativeSelect {...args} label="Favourite colour" selectedValue="green" />
    </Box>
  ),
};

export const WithError: Story = {
  render: (args) => (
    <Box width={280} padding="md">
      <NativeSelect {...args} label="Favourite colour" error="Please choose a colour" />
    </Box>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Box width={280} padding="md">
      <NativeSelect {...args} label="Favourite colour" selectedValue="red" />
    </Box>
  ),
};

export const RendersOptions: Story = {
  args: { testID: 'demo-native-select' },
  render: (args) => (
    <Box width={280} padding="md">
      <NativeSelect {...args} label="Colour" />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Colour')).toBeInTheDocument();
  },
};
