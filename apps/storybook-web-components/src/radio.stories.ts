import type { GhRadio } from '@ghds/web-components';
import { expect, userEvent } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

interface RadioArgs {
  label: string;
  value: string;
  checked: boolean;
  disabled: boolean;
}

function requireEl<T extends Element>(root: ParentNode | null, selector: string): T {
  const found = root?.querySelector<T>(selector);
  if (!found) {
    throw new Error(`expected to find ${selector}`);
  }
  return found;
}

const meta: Meta<RadioArgs> = {
  title: 'Components/Radio',
  tags: ['autodocs'],
  render: (args) =>
    html`<gh-radio
      label=${args.label}
      value=${args.value}
      ?checked=${args.checked}
      ?disabled=${args.disabled}
    ></gh-radio>`,
  args: { label: 'Small', value: 'sm', checked: false, disabled: false },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<RadioArgs>;

export const Default: Story = {};

export const Checked: Story = { args: { checked: true } };

export const Disabled: Story = { args: { disabled: true } };

/**
 * Visual-regression guard for GHD-44: the radio sits inside an
 * opaque-background container. If its control loses its stacking context, the
 * `z-index: -1` sketch ring paints behind this box and disappears.
 */
export const OnOpaqueSurface: Story = {
  args: { label: 'On an opaque surface', checked: true },
  render: (args) => html`
    <div style="background: var(--sys-color-bg-surface); padding: var(--sys-spacing-lg);">
      <gh-radio
        label=${args.label}
        value=${args.value}
        ?checked=${args.checked}
        ?disabled=${args.disabled}
      ></gh-radio>
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
      <gh-radio
        label=${args.label}
        value=${args.value}
        ?checked=${args.checked}
        ?disabled=${args.disabled}
      ></gh-radio>
    </div>
  `,
};

export const KeyboardInteraction: Story = {
  name: 'Interaction: keyboard checks the radio',
  play: async ({ canvasElement }) => {
    const host = requireEl<GhRadio>(canvasElement, 'gh-radio');
    const input = requireEl<HTMLInputElement>(host.shadowRoot, 'input');
    input.focus();
    await userEvent.keyboard(' ');
    await expect(host.checked).toBe(true);
  },
};
