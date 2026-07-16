import { type TabItem, Tabs } from '@ghds/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

const ITEMS: TabItem[] = [
  { value: 'overview', label: 'Overview', content: <p>The overview panel.</p> },
  { value: 'specs', label: 'Specs', content: <p>The specifications panel.</p> },
  { value: 'reviews', label: 'Reviews', content: <p>The reviews panel.</p> },
];

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { items: ITEMS, label: 'Product details' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SecondSelected: Story = {
  args: { defaultValue: 'specs' },
};

export const WithDisabledTab: Story = {
  args: {
    items: [
      ITEMS[0] as TabItem,
      { value: 'specs', label: 'Specs', content: <p>Specs</p>, disabled: true },
      ITEMS[2] as TabItem,
    ],
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('tab', { name: 'Overview' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Specs' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};
