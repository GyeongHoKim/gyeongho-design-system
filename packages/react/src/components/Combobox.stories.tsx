import type { Meta, StoryObj } from '@storybook/react-vite';
import { Combobox, type ComboboxOption } from './Combobox.js';

const OPTIONS: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian', disabled: true },
  { value: 'elderberry', label: 'Elderberry' },
];

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
} satisfies Meta<typeof Combobox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { options: OPTIONS, label: 'Favourite fruit', placeholder: 'Search fruit…' },
};

export const WithValue: Story = {
  args: { options: OPTIONS, label: 'Favourite fruit', defaultValue: 'cherry' },
};

export const Disabled: Story = {
  args: { options: OPTIONS, label: 'Favourite fruit', disabled: true },
};

export const OnDarkSurface: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Combobox options={OPTIONS} label="Favourite fruit" placeholder="Search fruit…" />
    </div>
  ),
};
