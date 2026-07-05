import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { FormField } from './FormField.js';
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

/**
 * Visual-regression guard for GHD-44: the field sits inside an opaque-background
 * container (colors/spacing from `@ghds/tokens` CSS vars). If its control loses
 * its stacking context, the `z-index: -1` sketch box paints behind this box and
 * disappears — flagged by Chromatic in both light and dark schemes.
 */
export const OnOpaqueSurface: Story = {
  args: { label: 'On an opaque surface' },
  render: (args) => (
    <div style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}>
      <Input {...args} />
    </div>
  ),
};

export const OnOpaqueSurfaceDark: Story = {
  args: { label: 'On a dark opaque surface' },
  render: (args) => (
    <div
      data-theme="dark"
      style={{ background: 'var(--sys-color-bg-surface)', padding: 'var(--sys-spacing-lg)' }}
    >
      <Input {...args} />
    </div>
  ),
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

/**
 * When wrapped in `FormField`, don't also pass `label`/`error` to `Input`
 * directly — `FormField` owns rendering those, and `Input` reads its id/
 * aria-invalid/aria-describedby from context instead.
 */
export const WrappedInFormField: Story = {
  render: () => (
    <FormField label="Email" error="Please enter a valid email">
      <Input placeholder="you@example.com" />
    </FormField>
  ),
};
