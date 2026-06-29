import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from './Input.js';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: { label: 'Email', placeholder: 'you@example.com' },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: { error: 'Please enter a valid email' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'locked@example.com' },
};

export const TypingInteraction: Story = {
  args: { label: 'Name' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText('Name');
    await userEvent.type(field, 'Ada Lovelace');
    await expect(field).toHaveValue('Ada Lovelace');
  },
};
