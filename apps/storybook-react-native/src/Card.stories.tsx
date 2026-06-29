import { Card, Text } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  args: { elevated: false },
  argTypes: { elevated: { control: 'boolean' } },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Flat: Story = {
  render: (args) => (
    <Card {...args}>
      <Text variant="title">Sketchy Card</Text>
      <Text variant="body">A hand-drawn surface container.</Text>
    </Card>
  ),
};

export const Elevated: Story = {
  args: { elevated: true },
  render: (args) => (
    <Card {...args}>
      <Text variant="title">Elevated Card</Text>
      <Text variant="body">Now with an offset sketch shadow.</Text>
    </Card>
  ),
};

export const RendersContent: Story = {
  args: { testID: 'demo-card' },
  render: (args) => (
    <Card {...args}>
      <Text>Inside the card</Text>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Inside the card')).toBeInTheDocument();
  },
};
