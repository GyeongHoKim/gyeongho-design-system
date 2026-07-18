import { InputGroup, InputGroupAddon, InputGroupInput } from '@ghds/react/input-group';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    disabled: false,
    invalid: false,
    style: { maxWidth: 360 },
    children: (
      <>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput placeholder="example.com" aria-label="Website" />
      </>
    ),
  },
} satisfies Meta<typeof InputGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LeadingAddon: Story = {};

export const TrailingAddon: Story = {
  args: {
    children: (
      <>
        <InputGroupInput placeholder="0.00" aria-label="Amount" />
        <InputGroupAddon>USD</InputGroupAddon>
      </>
    ),
  },
};

export const BothAddons: Story = {
  args: {
    children: (
      <>
        <InputGroupAddon>$</InputGroupAddon>
        <InputGroupInput placeholder="0.00" aria-label="Price" />
        <InputGroupAddon>/ mo</InputGroupAddon>
      </>
    ),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput defaultValue="ghds.dev" aria-label="Website" />
      </>
    ),
  },
};

export const Invalid: Story = {
  args: {
    invalid: true,
    children: (
      <>
        <InputGroupAddon>@</InputGroupAddon>
        <InputGroupInput defaultValue="not-an-email" aria-label="Email" />
      </>
    ),
  },
};

/** Typing flows through the bare inner input while the group paints one shared box. */
export const AcceptsInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Website' });
    await userEvent.type(input, 'ghds.dev');
    await expect(input).toHaveValue('ghds.dev');
  },
};

/**
 * Visual-regression guard: the sketch fill + stroke stay scoped to the field on
 * an opaque dark surface, in both the default and invalid strokes.
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
        maxWidth: 360,
      }}
    >
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput placeholder="example.com" aria-label="Website dark" />
      </InputGroup>
      <InputGroup invalid>
        <InputGroupAddon>@</InputGroupAddon>
        <InputGroupInput defaultValue="not-an-email" aria-label="Email dark" />
      </InputGroup>
    </div>
  ),
};
