import { expect, userEvent } from 'storybook/test';
import '@ghds/web-components/checkbox';
import type { GhCheckbox } from '@ghds/web-components/checkbox';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface CheckboxArgs {
  label: string;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
}

function requireEl<T extends Element>(root: ParentNode | null, selector: string): T {
  const found = root?.querySelector<T>(selector);
  if (!found) {
    throw new Error(`expected to find ${selector}`);
  }
  return found;
}

const meta: Meta<CheckboxArgs> = {
  title: 'Components/Checkbox',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-checkbox
      label=${args.label}
      ?checked=${args.checked}
      .indeterminate=${args.indeterminate}
      ?disabled=${args.disabled}
    ></gh-checkbox>`,
  args: {
    label: 'Subscribe to updates',
    checked: false,
    indeterminate: false,
    disabled: false,
  },
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<CheckboxArgs>;

export const Default: Story = {};

export const Checked: Story = { args: { checked: true } };

export const Indeterminate: Story = { args: { indeterminate: true } };

export const Disabled: Story = { args: { disabled: true } };

export const DisabledChecked: Story = { args: { disabled: true, checked: true } };

/**
 * Visual-regression guard for GHD-44: the checkbox sits inside an
 * opaque-background container. If its control loses its stacking context, the
 * `z-index: -1` sketch box paints behind this box and disappears.
 */
export const OnOpaqueSurface: Story = {
  args: { label: 'On an opaque surface', checked: true },
  render: (args) => html`
    <div style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-checkbox
        label=${args.label}
        ?checked=${args.checked}
        ?disabled=${args.disabled}
      ></gh-checkbox>
    </div>
  `,
};

export const OnOpaqueSurfaceDark: Story = {
  args: { label: 'On a dark opaque surface', checked: true },
  render: (args) => html`
    <div
      data-theme="dark"
      style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);"
    >
      <gh-checkbox
        label=${args.label}
        ?checked=${args.checked}
        ?disabled=${args.disabled}
      ></gh-checkbox>
    </div>
  `,
};

export const KeyboardInteraction: Story = {
  name: 'Interaction: keyboard toggles checked',
  play: async ({ canvasElement }) => {
    const host = requireEl<GhCheckbox>(canvasElement, 'gh-checkbox');
    const input = requireEl<HTMLInputElement>(host.shadowRoot, 'input');
    input.focus();
    await userEvent.keyboard(' ');
    await expect(host.checked).toBe(true);
  },
};
