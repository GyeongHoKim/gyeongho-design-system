import { NativeSelect } from '@ghds/react/native-select';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

const OPTIONS = (
  <>
    <option value="">Select a fruit…</option>
    <option value="apple">Apple</option>
    <option value="banana">Banana</option>
    <option value="cherry">Cherry</option>
  </>
);

const meta = {
  title: 'Components/NativeSelect',
  component: NativeSelect,
  argTypes: {
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Fruit',
    style: { minWidth: 220 },
    children: OPTIONS,
  },
} satisfies Meta<typeof NativeSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { label: undefined, 'aria-label': 'Fruit' },
};

export const WithLabel: Story = {};

export const WithError: Story = {
  args: { error: 'Please choose a fruit.' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'apple' },
};

/** Selecting an option updates the native select's value. */
export const SelectsOption: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByLabelText('Fruit') as HTMLSelectElement;
    await userEvent.selectOptions(select, 'banana');
    await expect(select.value).toBe('banana');
  },
};

/**
 * Visual-regression guard: the sketch fill + stroke stay scoped to the control
 * on an opaque dark surface, in both the default and error strokes.
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
        maxWidth: 260,
      }}
    >
      <NativeSelect label="Fruit" style={{ minWidth: 220 }}>
        {OPTIONS}
      </NativeSelect>
      <NativeSelect label="Fruit" error="Please choose a fruit." style={{ minWidth: 220 }}>
        {OPTIONS}
      </NativeSelect>
    </div>
  ),
};
