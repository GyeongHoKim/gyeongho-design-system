import { type Direction, DirectionProvider, useDirection } from '@ghds/react-native/direction';
import { Box, Text } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

/** Reads the ambient direction and renders a row that flips with it. */
function DirectionDemo() {
  const dir = useDirection();
  return (
    <Box
      flexDirection={dir === 'rtl' ? 'row-reverse' : 'row'}
      gap="sm"
      alignItems="center"
      padding="md"
    >
      <Text variant="label">Start</Text>
      <Text variant="body">→</Text>
      <Text variant="label">End</Text>
      <Text variant="caption">(dir: {dir})</Text>
    </Box>
  );
}

function Wrapper({ dir }: { dir: Direction }) {
  return (
    <DirectionProvider dir={dir}>
      <DirectionDemo />
    </DirectionProvider>
  );
}

const meta: Meta<typeof Wrapper> = {
  title: 'Components/Direction',
  component: Wrapper,
  args: { dir: 'ltr' },
  argTypes: { dir: { control: 'select', options: ['ltr', 'rtl'] } },
};

export default meta;
type Story = StoryObj<typeof Wrapper>;

export const LeftToRight: Story = { args: { dir: 'ltr' } };

export const RightToLeft: Story = { args: { dir: 'rtl' } };

export const RendersDirection: Story = {
  args: { dir: 'rtl' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('(dir: rtl)')).toBeInTheDocument();
  },
};
