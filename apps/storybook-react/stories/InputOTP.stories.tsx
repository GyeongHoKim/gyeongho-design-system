import { InputOTP } from '@ghds/react/input-otp';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Components/InputOTP',
  component: InputOTP,
  argTypes: {
    length: { control: { type: 'number', min: 2, max: 8, step: 1 } },
    mode: { control: 'inline-radio', options: ['numeric', 'text'] },
    mask: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    length: 6,
    mode: 'numeric',
    mask: false,
    disabled: false,
    invalid: false,
    'aria-label': 'One-time code',
  },
} satisfies Meta<typeof InputOTP>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FourCells: Story = {
  args: { length: 4 },
};

export const TextMode: Story = {
  args: { mode: 'text', defaultValue: 'AB3', 'aria-label': 'Alphanumeric code' },
};

export const Masked: Story = {
  args: { mask: true, defaultValue: '1234' },
};

export const WithLabel: Story = {
  args: { label: 'Verification code' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: '1234' },
};

export const Invalid: Story = {
  args: { invalid: true, defaultValue: '123456', label: 'Verification code' },
};

/** Typing a full code fires onComplete with the assembled value. */
export const TypesCode: Story = {
  args: {
    length: 4,
    label: 'Verification code',
    onComplete: fn(),
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const cells = canvas.getAllByRole('textbox');
    await userEvent.type(cells[0], '1');
    await userEvent.type(cells[1], '2');
    await userEvent.type(cells[2], '3');
    await userEvent.type(cells[3], '4');
    await expect(args.onComplete).toHaveBeenCalledWith('1234');
  },
};

/**
 * Visual-regression guard: each cell's sketch fill + stroke stay scoped on an
 * opaque dark surface, across the default, filled, and invalid strokes.
 */
export const OnOpaqueSurfaceDark: Story = {
  render: () => (
    <div
      data-theme="dark"
      style={{
        background: 'var(--sys-color-bg-surface)',
        padding: 'var(--sys-spacing-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sys-spacing-md)',
      }}
    >
      <InputOTP length={6} defaultValue="123" aria-label="Code dark" />
      <InputOTP length={6} invalid defaultValue="123456" aria-label="Invalid code dark" />
    </div>
  ),
};
