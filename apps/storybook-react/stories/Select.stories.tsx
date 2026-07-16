import { Select, SelectOption } from '@ghds/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Components/Select',
  component: Select,
  args: { label: 'Fruit', placeholder: 'Choose a fruit' },
  render: (args) => (
    <Select {...args}>
      <SelectOption value="apple">Apple</SelectOption>
      <SelectOption value="banana">Banana</SelectOption>
      <SelectOption value="cherry" disabled>
        Cherry
      </SelectOption>
      <SelectOption value="date">Date</SelectOption>
    </Select>
  ),
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { defaultValue: 'banana' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'banana' },
};

/**
 * Forces the panel open for Chromatic — a plain render only ever captures the
 * closed trigger, and the floating panel (shadow/elevation, selected/disabled
 * option colors) is otherwise never visually snapshotted.
 */
export const Open: Story = {
  args: { defaultValue: 'banana' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));
  },
};

export const OpenDark: Story = {
  args: { defaultValue: 'banana' },
  render: (args) => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Select {...args}>
        <SelectOption value="apple">Apple</SelectOption>
        <SelectOption value="banana">Banana</SelectOption>
        <SelectOption value="cherry" disabled>
          Cherry
        </SelectOption>
        <SelectOption value="date">Date</SelectOption>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox'));
  },
};

export const KeyboardInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveTextContent('Apple');
  },
};
