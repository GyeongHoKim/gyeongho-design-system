import { Accordion, type AccordionItem } from '@ghds/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

const ITEMS: AccordionItem[] = [
  { value: 'shipping', label: 'Shipping', content: <p>Ships in 2–3 business days.</p> },
  { value: 'returns', label: 'Returns', content: <p>Free returns within 30 days.</p> },
  { value: 'warranty', label: 'Warranty', content: <p>Covered for one year.</p> },
];

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  args: { items: ITEMS },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: { type: 'single', defaultValue: ['shipping'] },
};

export const Multiple: Story = {
  args: { type: 'multiple', defaultValue: ['shipping', 'returns'] },
};

export const Expands: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Returns' }));
    await expect(canvas.getByRole('button', { name: 'Returns' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  },
};
