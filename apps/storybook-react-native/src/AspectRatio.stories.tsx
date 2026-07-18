import { AspectRatio } from '@ghds/react-native/aspect-ratio';
import { Box, Text } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof AspectRatio> = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  args: { ratio: 16 / 9 },
  argTypes: { ratio: { control: 'number' } },
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

export const Widescreen: Story = {
  render: (args) => (
    <Box width={320}>
      <AspectRatio {...args}>
        <Box flex={1} alignItems="center" justifyContent="center" backgroundColor="bgMuted">
          <Text variant="body">16 : 9</Text>
        </Box>
      </AspectRatio>
    </Box>
  ),
};

export const Square: Story = {
  args: { ratio: 1 },
  render: (args) => (
    <Box width={200}>
      <AspectRatio {...args}>
        <Box flex={1} alignItems="center" justifyContent="center" backgroundColor="bgMuted">
          <Text variant="body">1 : 1</Text>
        </Box>
      </AspectRatio>
    </Box>
  ),
};

export const RendersContent: Story = {
  args: { testID: 'demo-ratio' },
  render: (args) => (
    <Box width={240}>
      <AspectRatio {...args}>
        <Box flex={1} alignItems="center" justifyContent="center" backgroundColor="bgMuted">
          <Text>Inside the ratio box</Text>
        </Box>
      </AspectRatio>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Inside the ratio box')).toBeInTheDocument();
  },
};
