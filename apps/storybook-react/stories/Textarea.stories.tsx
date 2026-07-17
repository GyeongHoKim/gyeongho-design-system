import { FormField } from '@ghds/react/form-field';
import { Textarea } from '@ghds/react/textarea';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  args: { label: 'Bio', placeholder: 'Tell us about yourself' },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: { error: 'Bio is required' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'Locked bio text' },
};

export const AutoResize: Story = {
  args: {
    label: 'Message',
    autoResize: true,
    defaultValue: 'This textarea grows to fit its content.\nAdd more lines and watch it expand.',
  },
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
      <Textarea {...args} />
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
      <Textarea {...args} />
    </div>
  ),
};

export const TypingInteraction: Story = {
  args: { label: 'Notes' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByLabelText('Notes');
    await userEvent.type(field, 'Ada Lovelace');
    await expect(field).toHaveValue('Ada Lovelace');
  },
};

/**
 * When wrapped in `FormField`, don't also pass `label`/`error` to `Textarea`
 * directly — `FormField` owns rendering those, and `Textarea` reads its id/
 * aria-invalid/aria-describedby from context instead.
 */
export const WrappedInFormField: Story = {
  render: () => (
    <FormField label="Bio" error="Bio is required">
      <Textarea placeholder="Tell us about yourself" />
    </FormField>
  ),
};
