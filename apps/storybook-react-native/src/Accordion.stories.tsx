import { Accordion, type AccordionItem } from '@ghds/react-native/accordion';
import { Text } from '@ghds/react-native/theme';
import type { Meta, StoryObj } from '@storybook/react';

const ITEMS: AccordionItem[] = [
  { value: 'shipping', label: 'Shipping', content: <Text>Ships in 2–3 business days.</Text> },
  { value: 'returns', label: 'Returns', content: <Text>Free returns within 30 days.</Text> },
  { value: 'warranty', label: 'Warranty', content: <Text>Covered for one year.</Text> },
];

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  args: { items: ITEMS },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Single: Story = { args: { type: 'single', defaultValue: ['shipping'] } };

export const Multiple: Story = {
  args: { type: 'multiple', defaultValue: ['shipping', 'returns'] },
};
