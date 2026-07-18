import { InputGroup, InputGroupAddon, InputGroupInput } from '@ghds/react-native/input-group';
import { Box } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof InputGroup> = {
  title: 'Components/InputGroup',
  component: InputGroup,
  args: { disabled: false, invalid: false },
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

export const WithAddons: Story = {
  render: (args) => (
    <Box width={320}>
      <InputGroup {...args}>
        <InputGroupAddon>@</InputGroupAddon>
        <InputGroupInput placeholder="username" />
        <InputGroupAddon>.dev</InputGroupAddon>
      </InputGroup>
    </Box>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Box width={320}>
      <InputGroup {...args}>
        <InputGroupAddon>@</InputGroupAddon>
        <InputGroupInput placeholder="username" />
      </InputGroup>
    </Box>
  ),
};

export const Invalid: Story = {
  args: { invalid: true },
  render: (args) => (
    <Box width={320}>
      <InputGroup {...args}>
        <InputGroupInput placeholder="you@example.com" />
      </InputGroup>
    </Box>
  ),
};

export const RendersContent: Story = {
  args: { testID: 'demo-group' },
  render: (args) => (
    <Box width={320}>
      <InputGroup {...args}>
        <InputGroupInput placeholder="Search…" testID="search-field" />
      </InputGroup>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByPlaceholderText('Search…')).toBeInTheDocument();
  },
};
