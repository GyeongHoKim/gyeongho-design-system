import { type TabItem, Tabs, Text } from '@ghds/react-native';
import type { Meta, StoryObj } from '@storybook/react';

const ITEMS: TabItem[] = [
  { value: 'overview', label: 'Overview', content: <Text>The overview panel.</Text> },
  { value: 'specs', label: 'Specs', content: <Text>The specifications panel.</Text> },
  { value: 'reviews', label: 'Reviews', content: <Text>The reviews panel.</Text> },
];

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { items: ITEMS, label: 'Product details' },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {};

export const SecondSelected: Story = { args: { defaultValue: 'specs' } };
