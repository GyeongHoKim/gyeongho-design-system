import { ToggleGroup, type ToggleGroupItem } from '@ghds/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const ITEMS: ToggleGroupItem[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const meta = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
} satisfies Meta<typeof ToggleGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: { type: 'single', items: ITEMS, defaultValue: 'center', 'aria-label': 'Text alignment' },
};

export const Multiple: Story = {
  args: {
    type: 'multiple',
    items: [
      { value: 'bold', label: 'Bold' },
      { value: 'italic', label: 'Italic' },
      { value: 'underline', label: 'Underline' },
    ],
    defaultValue: ['bold'],
    'aria-label': 'Text formatting',
  },
};

export const Disabled: Story = {
  args: { type: 'single', items: ITEMS, disabled: true, 'aria-label': 'Text alignment' },
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <ToggleGroup type="single" items={ITEMS} defaultValue="left" aria-label="Text alignment" />
    </div>
  ),
};
