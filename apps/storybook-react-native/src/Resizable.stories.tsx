import { Card } from '@ghds/react-native/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@ghds/react-native/resizable';
import { Box, Text } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof ResizablePanelGroup> = {
  title: 'Components/Resizable',
  component: ResizablePanelGroup,
  args: { direction: 'horizontal' },
  argTypes: {
    direction: { control: 'select', options: ['horizontal', 'vertical'] },
  },
};

export default meta;
type Story = StoryObj<typeof ResizablePanelGroup>;

function Pane({ label }: { label: string }) {
  return (
    <Box flex={1} padding="sm">
      <Card>
        <Box height={80} alignItems="center" justifyContent="center">
          <Text variant="title">{label}</Text>
        </Box>
      </Card>
    </Box>
  );
}

export const Horizontal: Story = {
  render: (args) => (
    <Box width={360} height={160}>
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize={50}>
          <Pane label="Left" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <Pane label="Right" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </Box>
  ),
};

export const Vertical: Story = {
  args: { direction: 'vertical' },
  render: (args) => (
    <Box width={280} height={280}>
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize={40}>
          <Pane label="Top" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>
          <Pane label="Bottom" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </Box>
  ),
};

export const ThreePanels: Story = {
  render: (args) => (
    <Box width={420} height={160}>
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize={33}>
          <Pane label="One" />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={34}>
          <Pane label="Two" />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={33}>
          <Pane label="Three" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </Box>
  ),
};

export const RendersPanels: Story = {
  args: { testID: 'demo-resizable' },
  render: (args) => (
    <Box width={360} height={140}>
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize={50}>
          <Pane label="A" />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <Pane label="B" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('A')).toBeInTheDocument();
  },
};
