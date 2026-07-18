import { Attachment } from '@ghds/react-native/attachment';
import { Box } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, within } from 'storybook/test';

const meta: Meta<typeof Attachment> = {
  title: 'Components/Attachment',
  component: Attachment,
  args: { name: 'report.pdf', meta: '2.4 MB' },
};

export default meta;
type Story = StoryObj<typeof Attachment>;

export const Default: Story = {
  render: (args) => (
    <Box padding="md" alignItems="flex-start">
      <Attachment {...args} />
    </Box>
  ),
};

export const WithIcon: Story = {
  args: { icon: 'external-link' },
  render: (args) => (
    <Box padding="md" alignItems="flex-start">
      <Attachment {...args} />
    </Box>
  ),
};

export const Removable: Story = {
  args: { icon: 'external-link', onRemove: fn() },
  render: (args) => (
    <Box padding="md" alignItems="flex-start">
      <Attachment {...args} />
    </Box>
  ),
};

export const RendersContent: Story = {
  args: { name: 'photo.png', meta: '820 KB', testID: 'demo-attachment' },
  render: (args) => (
    <Box padding="md" alignItems="flex-start">
      <Attachment {...args} />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('photo.png')).toBeInTheDocument();
  },
};
