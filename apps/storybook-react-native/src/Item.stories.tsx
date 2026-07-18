import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@ghds/react-native/item';
import { Box, Text } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof Item> = {
  title: 'Components/Item',
  component: Item,
  args: { variant: 'default', selected: false },
  argTypes: {
    variant: { control: 'select', options: ['default', 'muted', 'outline'] },
    selected: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Item>;

function Row(args: ComponentProps<typeof Item>) {
  return (
    <Box width={320}>
      <Item {...args}>
        <ItemMedia>
          <Text variant="title">◆</Text>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Notifications</ItemTitle>
          <ItemDescription>Push, email and SMS alerts</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Text variant="body">›</Text>
        </ItemActions>
      </Item>
    </Box>
  );
}

export const Default: Story = {
  render: (args) => <Row {...args} />,
};

export const Muted: Story = {
  args: { variant: 'muted' },
  render: (args) => <Row {...args} />,
};

export const Outline: Story = {
  args: { variant: 'outline' },
  render: (args) => <Row {...args} />,
};

export const Selected: Story = {
  args: { selected: true },
  render: (args) => <Row {...args} />,
};

export const RendersContent: Story = {
  args: { testID: 'demo-item' },
  render: (args) => <Row {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Notifications')).toBeInTheDocument();
  },
};
