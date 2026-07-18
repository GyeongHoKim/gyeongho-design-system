import { ScrollArea } from '@ghds/react-native/scroll-area';
import { Box, Text } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof ScrollArea> = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  args: { orientation: 'vertical' },
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal', 'both'] },
  },
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const ROWS = Array.from({ length: 20 }, (_, i) => `Row ${i + 1}`);

export const Vertical: Story = {
  render: (args) => (
    <Box width={280}>
      <ScrollArea {...args} style={{ height: 220 }}>
        {ROWS.map((row) => (
          <Box key={row} paddingVertical="xs">
            <Text variant="body">{row}</Text>
          </Box>
        ))}
      </ScrollArea>
    </Box>
  ),
};

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <Box width={280}>
      <ScrollArea {...args}>
        <Box flexDirection="row" gap="md">
          {ROWS.map((row) => (
            <Box key={row} width={120}>
              <Text variant="body">{row}</Text>
            </Box>
          ))}
        </Box>
      </ScrollArea>
    </Box>
  ),
};

export const RendersContent: Story = {
  args: { testID: 'demo-scroll-area' },
  render: (args) => (
    <Box width={280}>
      <ScrollArea {...args} style={{ height: 160 }}>
        <Text>Inside the scroll area</Text>
      </ScrollArea>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Inside the scroll area')).toBeInTheDocument();
  },
};
