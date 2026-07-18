import { Marker } from '@ghds/react-native/marker';
import { Box, Text } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof Marker> = {
  title: 'Components/Marker',
  component: Marker,
  args: { variant: 'default' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'info', 'danger'] },
  },
};

export default meta;
type Story = StoryObj<typeof Marker>;

export const Default: Story = {
  render: (args) => (
    <Box padding="md" flexDirection="row" alignItems="center">
      <Text variant="body">The </Text>
      <Marker {...args}>highlighted</Marker>
      <Text variant="body"> word.</Text>
    </Box>
  ),
};

export const Tones: Story = {
  render: () => (
    <Box padding="md" gap="sm" alignItems="flex-start">
      <Marker variant="default">default</Marker>
      <Marker variant="success">success</Marker>
      <Marker variant="info">info</Marker>
      <Marker variant="danger">danger</Marker>
    </Box>
  ),
};

export const RendersContent: Story = {
  args: { testID: 'demo-marker' },
  render: (args) => (
    <Box padding="md" alignItems="flex-start">
      <Marker {...args}>Scribbled</Marker>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Scribbled')).toBeInTheDocument();
  },
};
